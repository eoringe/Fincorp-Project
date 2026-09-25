"""
Live Collaborative Idea Board — Flask Backend
Handles write operations (create ideas, upvote) with validation.
Reads are handled directly by the frontend via Supabase Realtime.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests as http_client
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")


def _supabase_headers():
    """Build headers for Supabase REST API requests."""
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# ──────────────────────────────────────────────
# POST /api/ideas — Create a new idea
# ──────────────────────────────────────────────
@app.route("/api/ideas", methods=["POST"])
def create_idea():
    """
    Create a new idea after validation.
    
    Request body:
        { "text": "My brilliant idea" }
    
    Validation rules:
        - text is required
        - text cannot be empty or whitespace-only
        - text must be 200 characters or less
    """
    data = request.get_json(silent=True)

    # Validate request body exists
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    text = data.get("text")

    # Validate text is present
    if text is None or not isinstance(text, str):
        return jsonify({"error": "Idea text is required"}), 400

    # Strip whitespace and validate non-empty
    text = text.strip()
    if len(text) == 0:
        return jsonify({"error": "Idea text cannot be empty"}), 400

    # Validate max length
    if len(text) > 200:
        return jsonify({
            "error": f"Idea text must be 200 characters or less (currently {len(text)} characters)"
        }), 400

    # Insert into Supabase
    try:
        response = http_client.post(
            f"{SUPABASE_URL}/rest/v1/ideas",
            headers=_supabase_headers(),
            json={"text": text},
        )

        if response.status_code == 201:
            created_idea = response.json()
            return jsonify(created_idea[0]), 201
        else:
            app.logger.error(f"Supabase insert failed: {response.status_code} — {response.text}")
            return jsonify({"error": "Failed to create idea"}), 500

    except http_client.RequestException as e:
        app.logger.error(f"Network error: {e}")
        return jsonify({"error": "Could not connect to database"}), 503


# ──────────────────────────────────────────────
# POST /api/ideas/<id>/upvote — Upvote an idea
# ──────────────────────────────────────────────
@app.route("/api/ideas/<idea_id>/upvote", methods=["POST"])
def upvote_idea(idea_id):
    """
    Atomically increment the upvote count for an idea.
    Uses a Postgres function to avoid race conditions.
    """
    try:
        response = http_client.post(
            f"{SUPABASE_URL}/rest/v1/rpc/increment_upvotes",
            headers=_supabase_headers(),
            json={"idea_id": idea_id},
        )

        if response.status_code in (200, 204):
            return jsonify({"success": True}), 200
        else:
            app.logger.error(f"Supabase upvote failed: {response.status_code} — {response.text}")
            return jsonify({"error": "Failed to upvote idea"}), 500

    except http_client.RequestException as e:
        app.logger.error(f"Network error: {e}")
        return jsonify({"error": "Could not connect to database"}), 503


# ──────────────────────────────────────────────
# GET /api/health — Health check
# ──────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "service": "idea-board-api"}), 200


# ──────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("FLASK_PORT", 5000)))
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    print(f"🚀 Idea Board API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
