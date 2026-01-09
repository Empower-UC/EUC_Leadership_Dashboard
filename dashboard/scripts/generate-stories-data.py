#!/usr/bin/env python3
"""
Participant Stories Data Generator

Processes participant stories from Excel and cross-references with outcomes data
to produce a structured JSON file for the dashboard.

Output: lib/data/participant-stories.json
"""

import pandas as pd
import numpy as np
import json
import re
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional

# Paths
RAW_DATA = Path(__file__).parent.parent.parent / "data" / "raw"
PROCESSED_DATA = Path(__file__).parent.parent.parent / "data" / "processed"
OUTPUT_DIR = Path(__file__).parent.parent / "lib" / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

# =============================================================================
# ARCHETYPE CLASSIFICATION KEYWORDS
# =============================================================================

ARCHETYPE_KEYWORDS = {
    "first-in-family": [
        "first in family", "first generation", "first in my family",
        "never went to college", "first to graduate", "first to attend",
        "no one in my family", "breaking the cycle", "generational"
    ],
    "career-builder": [
        "promotion", "career", "raise", "wage increase", "new job",
        "better job", "job change", "advancement", "professional",
        "certification", "degree", "graduated", "nursing", "healthcare"
    ],
    "stability-architect": [
        "stable housing", "new car", "reliable transportation",
        "moved into", "apartment", "home", "purchased", "savings",
        "emergency fund", "budget", "bills paid"
    ],
    "two-generation-leader": [
        "children", "kids", "son", "daughter", "family",
        "better life for", "future for my", "school", "daycare",
        "role model", "example for"
    ],
    "crisis-navigator": [
        "domestic violence", "abuse", "survivor", "homeless",
        "abandoned", "left me", "divorce", "single mom", "single parent",
        "prison", "jail", "incarcerated", "recovery", "addiction"
    ],
    "system-connector": [
        "partner", "referred", "connected", "agency", "organization",
        "circles", "IDA", "matched savings", "financial coaching",
        "navigator helped", "resources"
    ]
}

# =============================================================================
# TAG EXTRACTION KEYWORDS
# =============================================================================

TAG_KEYWORDS = {
    "graduation": ["225%", "graduated", "exited", "self-sufficient"],
    "income-increase": ["wage", "income", "raise", "promotion", "better pay", "salary"],
    "education": ["college", "degree", "certification", "school", "class", "training", "GED"],
    "cliff-navigation": ["cliff", "benefits", "lose", "scared to", "afraid to work"],
    "children-family": ["children", "kids", "son", "daughter", "family", "baby", "child"],
    "career-employment": ["job", "career", "work", "employed", "employer", "position"],
    "partner-services": ["partner", "circles", "IDA", "financial coach", "agency"],
    "transportation": ["car", "vehicle", "transportation", "driving", "license"],
    "housing": ["house", "home", "apartment", "rent", "housing", "moved"],
    "single-parenting": ["single mom", "single parent", "alone", "by myself", "only parent"]
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def generate_story_id(name: str, timestamp: str) -> str:
    """Generate a stable ID from name and timestamp."""
    raw = f"{name}_{timestamp}"
    return f"story_{hashlib.md5(raw.encode()).hexdigest()[:8]}"


def anonymize_name(full_name: str) -> str:
    """Convert full name to first name + last initial."""
    if pd.isna(full_name) or not full_name:
        return "Anonymous"
    parts = str(full_name).strip().split()
    if len(parts) >= 2:
        return f"{parts[0]} {parts[-1][0]}."
    return parts[0] if parts else "Anonymous"


def classify_archetypes(story_text: str) -> list[str]:
    """Classify story into archetypes based on keyword matching."""
    if pd.isna(story_text):
        return []

    text_lower = story_text.lower()
    archetypes = []

    for archetype, keywords in ARCHETYPE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                archetypes.append(archetype)
                break

    return archetypes


def extract_tags(story_text: str) -> list[str]:
    """Extract theme tags from story text."""
    if pd.isna(story_text):
        return []

    text_lower = story_text.lower()
    tags = []

    for tag, keywords in TAG_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                tags.append(tag)
                break

    return tags


def calculate_story_depth(story: dict) -> str:
    """Calculate story depth based on total word count."""
    total_words = 0
    for field in ['success', 'financialSituation', 'inspiration', 'challenges', 'lifeChanged']:
        text = story.get('fullStory', {}).get(field, '')
        if text:
            total_words += len(str(text).split())

    if total_words >= 500:
        return "detailed"
    elif total_words >= 200:
        return "moderate"
    return "brief"


def extract_pull_quote(inspiration: str, success: str, life_changed: str) -> str:
    """Extract a compelling, shareable quote prioritizing inspiration content."""

    # Priority 1: Use inspiration field when it starts with first-person
    if pd.notna(inspiration) and len(str(inspiration).strip()) > 30:
        text = str(inspiration).strip()

        # Check if it starts with first-person (indicates a direct quote-like statement)
        first_person_start = text.lower().startswith(('i ', "i'", 'my ', 'we ', "we'", 'our ', 'being '))

        if first_person_start:
            # Take the first sentence or two, up to ~180 chars
            sentences = re.split(r'[.!?]+', text)
            quote = sentences[0].strip()
            if len(quote) < 50 and len(sentences) > 1:
                quote = f"{quote}. {sentences[1].strip()}"
            if 30 <= len(quote) <= 200:
                return quote

        # Also check for compelling first-person content anywhere in inspiration
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if 40 <= len(sentence) <= 180:
                first_person = any(w in sentence.lower() for w in ['i ', "i'", 'my ', 'we ', "we'", 'our '])
                compelling = any(w in sentence.lower() for w in [
                    'wanted', 'want', 'dream', 'hope', 'better', 'future', 'kids', 'children',
                    'family', 'change', 'break', 'cycle', 'show', 'prove', 'goal', 'never'
                ])
                if first_person and compelling:
                    return sentence

    # Priority 2: Look for actual quoted text in any field
    for text in [inspiration, success, life_changed]:
        if pd.notna(text):
            quotes = re.findall(r'"([^"]+)"', str(text))
            valid_quotes = [q for q in quotes if 25 <= len(q) <= 180]
            if valid_quotes:
                return max(valid_quotes, key=len)

    # Return empty if nothing good found - better no quote than bad quote
    return ""


def generate_headline(story: dict, archetypes: list[str]) -> str:
    """Generate a compelling headline for the story."""
    name = story.get('participantName', 'Participant')

    # Use primary archetype if available
    if 'first-in-family' in archetypes:
        return f"{name}: Breaking the Generational Cycle"
    elif 'career-builder' in archetypes:
        return f"{name}: Building a Career Pathway"
    elif 'stability-architect' in archetypes:
        return f"{name}: Creating Family Stability"
    elif 'two-generation-leader' in archetypes:
        return f"{name}: A Future for the Next Generation"
    elif 'crisis-navigator' in archetypes:
        return f"{name}: Overcoming Crisis to Thrive"
    elif 'system-connector' in archetypes:
        return f"{name}: Connected to Opportunity"

    return f"{name}'s Journey to Self-Sufficiency"


def calculate_metric_relevance(story: dict, outcomes: dict) -> dict:
    """Calculate relevance scores for each metric type."""
    tags = story.get('tags', [])
    fpl_change = outcomes.get('fpl_change', 0)
    wage_gain = outcomes.get('wage_gain', 0)

    return {
        "fplGraduation": min(1.0, fpl_change / 125) if fpl_change > 0 else 0.0,
        "wageGains": min(1.0, wage_gain / 15000) if wage_gain > 0 else (0.5 if 'income-increase' in tags else 0.0),
        "childrenImpact": 1.0 if 'children-family' in tags else 0.3,
        "cliffCrossings": 1.0 if 'cliff-navigation' in tags else 0.0,
        "partnerEngagement": 0.8 if 'partner-services' in tags else 0.2
    }


def assess_emotional_resonance(story_text: str, archetypes: list[str]) -> str:
    """Assess emotional resonance of a story."""
    if pd.isna(story_text):
        return "low"

    text_lower = story_text.lower()
    high_resonance_words = [
        "grateful", "thankful", "changed my life", "saved", "dream",
        "proud", "hope", "believe", "never thought", "finally"
    ]
    medium_resonance_words = [
        "helped", "better", "improved", "support", "opportunity"
    ]

    high_count = sum(1 for word in high_resonance_words if word in text_lower)
    medium_count = sum(1 for word in medium_resonance_words if word in text_lower)

    # Crisis navigators often have high emotional resonance
    if 'crisis-navigator' in archetypes:
        high_count += 1

    if high_count >= 2:
        return "high"
    elif high_count >= 1 or medium_count >= 2:
        return "medium"
    return "low"


# =============================================================================
# MAIN DATA PROCESSING
# =============================================================================

def load_stories():
    """Load participant stories from Excel."""
    stories_file = RAW_DATA / "Copy of Participant Story (Responses).xlsx"

    if not stories_file.exists():
        raise FileNotFoundError(f"Stories file not found: {stories_file}")

    df = pd.read_excel(stories_file)
    print(f"Loaded {len(df)} stories from Excel")
    return df


def load_navigator_data():
    """Load Navigator Dashboard for FPL and outcome data."""
    nav_file = RAW_DATA / "Navigator Dashboard.xlsx"

    if not nav_file.exists():
        print("Warning: Navigator Dashboard not found, proceeding without outcome data")
        return None

    nav_data = pd.read_excel(nav_file, sheet_name="Monthly Client Review")
    print(f"Loaded {len(nav_data)} records from Navigator Dashboard")
    return nav_data


def load_baseline_data():
    """Load Baseline Assessment for demographics."""
    baseline_file = RAW_DATA / "Baseline Assessment Report (86).xlsx"

    if not baseline_file.exists():
        print("Warning: Baseline Assessment not found, proceeding without demographics")
        return None

    baseline = pd.read_excel(baseline_file)
    print(f"Loaded {len(baseline)} records from Baseline Assessment")
    return baseline


def match_outcomes(participant_name: str, nav_data: Optional[pd.DataFrame]) -> dict:
    """Match participant to their outcome data from Navigator Dashboard."""
    default_outcomes = {
        "fpl_at_enrollment": None,
        "fpl_at_exit": None,
        "fpl_change": 0,
        "wage_gain": 0,
        "days_in_program": None
    }

    if nav_data is None or pd.isna(participant_name):
        return default_outcomes

    name_lower = str(participant_name).lower().strip()

    # Try exact match first
    for _, row in nav_data.iterrows():
        if pd.notna(row.get('Participant Name')):
            nav_name = str(row['Participant Name']).lower().strip()
            if nav_name == name_lower or name_lower in nav_name or nav_name in name_lower:
                fpl_enroll = pd.to_numeric(row.get('FPL at Enrollment'), errors='coerce')
                fpl_current = pd.to_numeric(row.get('Current FPL'), errors='coerce')
                wage_gain = pd.to_numeric(row.get('Wage Increases Since Enrollment'), errors='coerce')

                return {
                    "fpl_at_enrollment": float(fpl_enroll) if pd.notna(fpl_enroll) else None,
                    "fpl_at_exit": float(fpl_current) if pd.notna(fpl_current) else None,
                    "fpl_change": float(fpl_current - fpl_enroll) if pd.notna(fpl_enroll) and pd.notna(fpl_current) else 0,
                    "wage_gain": float(wage_gain) if pd.notna(wage_gain) else 0,
                    "days_in_program": None
                }

    return default_outcomes


def match_demographics(participant_name: str, baseline: Optional[pd.DataFrame]) -> dict:
    """Match participant to demographics from Baseline Assessment."""
    default_demo = {
        "county": "Unknown",
        "household_size": None,
        "children_count": None
    }

    if baseline is None or pd.isna(participant_name):
        return default_demo

    name_lower = str(participant_name).lower().strip()

    # Look for name column (could be various formats)
    name_cols = [c for c in baseline.columns if 'name' in c.lower()]

    for name_col in name_cols:
        for _, row in baseline.iterrows():
            if pd.notna(row.get(name_col)):
                base_name = str(row[name_col]).lower().strip()
                if base_name == name_lower or name_lower in base_name or base_name in name_lower:
                    # Find county column
                    county = None
                    for c in baseline.columns:
                        if 'county' in c.lower():
                            county = row.get(c)
                            break

                    # Find household size
                    hh_size = None
                    for c in baseline.columns:
                        if 'household' in c.lower() and 'size' in c.lower():
                            hh_size = pd.to_numeric(row.get(c), errors='coerce')
                            break

                    return {
                        "county": str(county) if pd.notna(county) else "Unknown",
                        "household_size": int(hh_size) if pd.notna(hh_size) else None,
                        "children_count": int(hh_size - 1) if pd.notna(hh_size) and hh_size > 1 else None
                    }

    return default_demo


def process_stories(stories_df: pd.DataFrame, nav_data: Optional[pd.DataFrame],
                   baseline: Optional[pd.DataFrame]) -> list[dict]:
    """Process all stories into structured format."""
    processed = []

    # Column mapping (handle various column name formats)
    col_map = {}
    for col in stories_df.columns:
        col_lower = col.lower()
        if 'timestamp' in col_lower:
            col_map['timestamp'] = col
        elif 'name' in col_lower and 'participant' in col_lower:
            col_map['name'] = col
        elif 'release' in col_lower or 'signed' in col_lower:
            col_map['release'] = col
        elif 'success' in col_lower:
            col_map['success'] = col
        elif 'financial' in col_lower:
            col_map['financial'] = col
        elif 'inspired' in col_lower or 'inspiration' in col_lower:
            col_map['inspiration'] = col
        elif 'discover' in col_lower:
            col_map['discovery'] = col
        elif 'challenge' in col_lower:
            col_map['challenges'] = col
        elif 'development' in col_lower or 'skill' in col_lower:
            col_map['development'] = col
        elif 'partner' in col_lower and 'organization' in col_lower.replace('success', ''):
            col_map['partners'] = col
        elif 'life' in col_lower and 'change' in col_lower:
            col_map['life_changed'] = col
        elif 'ripple' in col_lower or 'community' in col_lower:
            col_map['ripple'] = col
        elif 'video' in col_lower or 'film' in col_lower:
            col_map['willing_film'] = col

    for idx, row in stories_df.iterrows():
        participant_name = row.get(col_map.get('name', ''), '')
        timestamp = str(row.get(col_map.get('timestamp', ''), ''))

        # Get consent status
        release_val = str(row.get(col_map.get('release', ''), '')).lower()
        release_signed = 'yes' in release_val or 'true' in release_val

        film_val = str(row.get(col_map.get('willing_film', ''), '')).lower()
        willing_film = 'yes' in film_val or 'true' in film_val

        # Build full story text
        success = str(row.get(col_map.get('success', ''), '')) if pd.notna(row.get(col_map.get('success', ''))) else ''
        financial = str(row.get(col_map.get('financial', ''), '')) if pd.notna(row.get(col_map.get('financial', ''))) else ''
        inspiration = str(row.get(col_map.get('inspiration', ''), '')) if pd.notna(row.get(col_map.get('inspiration', ''))) else ''
        challenges = str(row.get(col_map.get('challenges', ''), '')) if pd.notna(row.get(col_map.get('challenges', ''))) else ''
        life_changed = str(row.get(col_map.get('life_changed', ''), '')) if pd.notna(row.get(col_map.get('life_changed', ''))) else ''

        full_text = f"{success} {financial} {inspiration} {challenges} {life_changed}"

        # Classify and tag
        archetypes = classify_archetypes(full_text)
        tags = extract_tags(full_text)

        # Get outcomes and demographics
        outcomes = match_outcomes(participant_name, nav_data)
        demographics = match_demographics(participant_name, baseline)

        # Build story object
        story = {
            "id": generate_story_id(str(participant_name), timestamp),
            "participantName": anonymize_name(participant_name) if release_signed else "Anonymous",
            "county": demographics['county'],
            "releaseFormSigned": release_signed,
            "willingToFilm": willing_film,
            "photoPath": None,  # To be populated when photos are added
            "headline": "",  # Will be set after archetypes
            "pullQuote": extract_pull_quote(inspiration, success, life_changed),
            "fullStory": {
                "success": success,
                "financialSituation": financial,
                "inspiration": inspiration,
                "challenges": challenges,
                "lifeChanged": life_changed
            },
            "archetypes": archetypes,
            "tags": tags,
            "metricRelevance": {},  # Will be set after outcomes
            "outcomes": {
                "fplAtEnrollment": outcomes['fpl_at_enrollment'],
                "fplAtExit": outcomes['fpl_at_exit'],
                "wageGainAnnual": outcomes['wage_gain'],
                "daysInProgram": outcomes['days_in_program']
            },
            "storyDepth": "",  # Will be calculated
            "emotionalResonance": ""  # Will be calculated
        }

        # Set derived fields
        story['headline'] = generate_headline({"participantName": story['participantName']}, archetypes)
        story['metricRelevance'] = calculate_metric_relevance({"tags": tags}, outcomes)
        story['storyDepth'] = calculate_story_depth(story)
        story['emotionalResonance'] = assess_emotional_resonance(full_text, archetypes)

        processed.append(story)

    return processed


def calculate_distributions(stories: list[dict]) -> dict:
    """Calculate theme and archetype distributions."""
    theme_counts = {}
    archetype_counts = {}

    total = len(stories)

    for story in stories:
        for tag in story.get('tags', []):
            theme_counts[tag] = theme_counts.get(tag, 0) + 1
        for archetype in story.get('archetypes', []):
            archetype_counts[archetype] = archetype_counts.get(archetype, 0) + 1

    theme_dist = {
        tag: {"count": count, "percentage": round(count / total * 100)}
        for tag, count in sorted(theme_counts.items(), key=lambda x: -x[1])
    }

    archetype_dist = {
        arch: {"count": count, "percentage": round(count / total * 100)}
        for arch, count in sorted(archetype_counts.items(), key=lambda x: -x[1])
    }

    return {
        "themeDistribution": theme_dist,
        "archetypeDistribution": archetype_dist
    }


def main():
    """Main entry point."""
    print("=" * 60)
    print("PARTICIPANT STORIES DATA GENERATOR")
    print("=" * 60)

    # Load data sources
    stories_df = load_stories()
    nav_data = load_navigator_data()
    baseline = load_baseline_data()

    # Process stories
    print("\nProcessing stories...")
    stories = process_stories(stories_df, nav_data, baseline)
    print(f"Processed {len(stories)} stories")

    # Calculate distributions
    distributions = calculate_distributions(stories)

    # Count stats
    with_release = sum(1 for s in stories if s['releaseFormSigned'])
    with_film = sum(1 for s in stories if s['willingToFilm'])
    with_photos = sum(1 for s in stories if s.get('photoPath'))

    # Build output
    output = {
        "metadata": {
            "generated_at": datetime.now().isoformat(),
            "total_stories": len(stories),
            "stories_with_release": with_release,
            "stories_willing_to_film": with_film,
            "stories_with_photos": with_photos
        },
        **distributions,
        "stories": stories
    }

    # Write output
    output_file = OUTPUT_DIR / "participant-stories.json"
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nOutput written to: {output_file}")
    print(f"\nSummary:")
    print(f"  Total stories: {len(stories)}")
    print(f"  With release signed: {with_release} ({with_release/len(stories)*100:.0f}%)")
    print(f"  Willing to film: {with_film} ({with_film/len(stories)*100:.0f}%)")
    print(f"\nTheme distribution:")
    for tag, data in list(distributions['themeDistribution'].items())[:5]:
        print(f"  {tag}: {data['count']} ({data['percentage']}%)")
    print(f"\nArchetype distribution:")
    for arch, data in list(distributions['archetypeDistribution'].items())[:5]:
        print(f"  {arch}: {data['count']} ({data['percentage']}%)")


if __name__ == "__main__":
    main()
