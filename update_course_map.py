import json

with open(r'C:\aymen\master 2\cmm\cmm ai\content\course-map.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update metadata
data['source'] = "tds/Fiches_TD_Communication_Multimedia_TD1-TD6_corrige_graphique.md (exercise statements only) + tds_multimedia_v4(1).html (Jupyter export) + course PDFs"
data['source_note'] = "NO official corrections exist in source materials. All solutions independently derived from course theory."
data['solution_policy'] = "Every solution carries status: independently-derived | suggested-answer | needs-teacher-verification | reference-implementation. Golden tests verify internal consistency only."

# Add solution_status and confidence to each exercise
for td in data['tds']:
    for ex in td['exercises']:
        if ex['type'] == 'calc':
            ex['solution_status'] = 'independently-derived'
            ex['confidence'] = 'high'
        elif ex['type'] == 'qcm':
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
        elif ex['type'] in ('concept', 'design'):
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
        elif ex['type'] == 'lab':
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
        else:
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
        
        # Special cases
        if ex.get('num') == 2 and td['id'] == 'TD3':  # TD3 Ex2 - PTS/DTS impossibility
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
            ex['needs_teacher_verification'] = True
            ex['verification_note'] = "B-frame DTS=80 > PTS=0 physically impossible. Teach expected answer + add 'Piège: PTS≥DTS réel'."
        if ex.get('num') == 2 and td['id'] == 'TD5':  # TD5 Ex2 - jitter multiple definitions
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
            ex['needs_teacher_verification'] = True
            ex['verification_note'] = "Multiple jitter definitions exist. Mark max-min=60ms as 'attendu', flag others."
        if ex.get('num') == 1 and td['id'] == 'TD3':  # TD3 Ex1 - missing parts
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
            ex['needs_teacher_verification'] = True
            ex['verification_note'] = "Source only has parts a) and d). Parts b) and c) missing from sheet."
        if ex.get('num') == 7 and td['id'] == 'TD2':  # TD2 Ex7 - QCM
            ex['solution_status'] = 'suggested-answer'
            ex['confidence'] = 'medium'
        if ex.get('num') == 3 and td['id'] == 'TD1':  # TD1 Ex3 - v(t) approximation
            ex['solution_status'] = 'independently-derived'
            ex['confidence'] = 'high'
            ex['approximation_note'] = "Curve reconstructed from spline points (16 subdivisions over 2s). Approximation noted."

# Update unit_conventions with independent derivation
data['unit_conventions'] = {
    "TD1_Ex1": "decimal",
    "TD1_Ex16": "binary",
    "TD1_Ex12": "decimal",
    "TD2_Ex6": "binary",
    "TD4_Ex6": "decimal",
    "rule": "Global toggle Décimal/Binaire. Tag each exercise with independently derived convention. Display both where they differ."
}

# Update content_defects with independent derivation references
for defect in data['content_defects']:
    defect['reference'] = 'independently derived solution'

# Update golden tests note
data['golden_tests_note'] = "Golden tests verify INTERNAL MATHEMATICAL CONSISTENCY ONLY. They do NOT prove the answer matches a teacher's correction (no official corrections exist)."

with open(r'C:\aymen\master 2\cmm\cmm ai\content\course-map.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Updated course-map.json with solution status and confidence fields")