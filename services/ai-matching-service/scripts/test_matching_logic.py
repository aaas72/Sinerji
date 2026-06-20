import sys
import os

# Add the current directory to sys.path to import app modules
sys.path.append(os.getcwd())

from app.skill_ontology import get_implication_confidence, expand_student_implied_skills
from app.utils import canonicalize_skill_name

def print_header(text):
    print("\n" + "="*80)
    print(f" {text}")
    print("="*80)

def print_test_case(skill_a, skill_b, expected_logic):
    confidence = get_implication_confidence(skill_a, skill_b)
    result = "[PASS]" if confidence > 0 else "[FAIL]"
    color = "\033[92m" if confidence > 0 else "\033[91m"
    reset = "\033[0m"
    
    print(f"\n[Scenario]: Student has '{skill_a}', Task needs '{skill_b}'")
    print(f"  - Reasoning: {expected_logic}")
    print(f"  - AI Confidence: {color}{confidence:.2f}{reset}")
    print(f"  - Outcome: {color}{'Semantic Match Found' if confidence > 0 else 'No Match'}{reset}")

def main():
    print_header("SINERJI AI MATCHING ENGINE - DEEP VALIDATION TEST")
    print("This test validates if the AI understands relationships, transitivity, and logic.")

    # --- TEST 1: Direct Relationships (New Majors) ---
    print_header("1. DIRECT RELATIONSHIPS (The 'Aha!' Moment)")
    print_test_case("dentistry", "healthcare", "Dentistry is a specialized branch of healthcare.")
    print_test_case("accounting", "finance", "Accountants are fundamentally trained in finance.")
    print_test_case("nursing", "medicine", "Nursing involves medical knowledge/practice.")

    # --- TEST 2: Transitive Chains (Logic Depth) ---
    print_header("2. TRANSITIVE CHAINS (Deep Logic - A -> B -> C)")
    # Mechatronics -> Robotics -> Engineering
    print_test_case("mechatronics", "robotics", "Mechatronics implies Robotics directly.")
    print_test_case("mechatronics", "engineering", "Mechatronics implies Engineering via Robotics/Mech Eng.")
    # Islamic History -> Islamic Studies -> Theology
    print_test_case("islamic history", "theology", "History leads to Studies, which leads to Theology.")

    # --- TEST 3: Modern Professional Logic (Agile/PM) ---
    print_header("3. PROFESSIONAL WORKFLOW LOGIC")
    print_test_case("scrum", "agile", "Scrum is an implementation of Agile.")
    print_test_case("agile methodologies", "project management", "Agile is a PM framework.")
    print_test_case("jira", "agile", "Jira usage heavily implies Agile workflow.")

    # --- TEST 4: Cross-Disciplinary Skills (The Generalist) ---
    print_header("4. CROSS-DISCIPLINARY SOFT SKILLS")
    print_test_case("leadership", "management", "Leaders are likely good at management.")
    print_test_case("communication", "public speaking", "Communication skills cover public speaking.")

    # --- TEST 5: Negative Sanity Check (Preventing Hallucinations) ---
    print_header("5. NEGATIVE SANITY CHECK (The 'Common Sense' Filter)")
    print_test_case("python", "veterinary medicine", "A programmer is NOT a vet. Should be 0.00.")
    print_test_case("accounting", "civil engineering", "An accountant is NOT a civil engineer. Should be 0.00.")

    # --- TEST 6: STRESS TEST - CROSS-DISCIPLINARY BLENDS ---
    print_header("6. STRESS TEST: CROSS-DISCIPLINARY BLENDS")
    
    print("\n[Scenario A]: The 'Data-Driven Farmer'")
    # Does Data Analysis help in Agriculture? 
    # Logic: Data Science -> Data Analysis -> (None direct to Agriculture yet, let's see)
    print_test_case("data analysis", "agricultural engineering", "Testing if generic data skills bridge to Ag-Tech.")

    print("\n[Scenario B]: The 'Strategic Communicator'")
    # Student has Psychology and Marketing. Are they good for PR?
    conf1 = get_implication_confidence("psychology", "public relations")
    conf2 = get_implication_confidence("marketing", "public relations")
    print(f"  - Psychology -> PR Confidence: {conf1:.2f}")
    print(f"  - Marketing  -> PR Confidence: {conf2:.2f}")
    print(f"  - Combined Logic: A student with both has higher 'Semantic Breadth'.")

    # --- TEST 7: TRANSITIVITY DEPTH & DECAY ---
    print_header("7. TRANSITIVITY DEPTH (The Logic Chain)")
    # Testing: stm32 -> microcontrollers -> embedded systems -> engineering
    # Note: Our engine only supports 1 level of transitivity (Direct + 1 jump)
    print_test_case("stm32", "microcontrollers", "Level 0: Direct")
    print_test_case("stm32", "embedded systems", "Level 1: Transitive (stm32 -> micro -> embedded)")
    print_test_case("stm32", "engineering", "Level 2: (Beyond Engine Limit - Should be 0 unless direct)")

    # --- TEST 8: FULL PROFILE EXPANSION TEST ---
    print_header("8. COMPLEX PROFILE EXPANSION")
    print("\n[Scenario]: A student with a diverse 'Polymath' profile:")
    print("Skills: 'Biology', 'Data Analysis', 'Leadership'")
    
    # Mocking StudentSkill object
    class MockSkill:
        def __init__(self, name, level=3):
            self.skill_name = name
            self.level = level

    student_map = {
        "biology": MockSkill("Biology"),
        "data analysis": MockSkill("Data Analysis"),
        "leadership": MockSkill("Leadership")
    }
    
    implied = expand_student_implied_skills(student_map)
    print(f"\nAI is mapping the student's global expertise...")
    print(f"{'Implied Skill':<25} | {'Confidence':<10} | {'Found via Source'}")
    print("-" * 65)
    # Filter for interesting insights
    for skill, (conf, source, level) in sorted(implied.items(), key=lambda x: x[1][0], reverse=True):
        if conf > 0.5: # Only show high-confidence implications
            print(f"{skill:<25} | {conf:<10.2f} | {source}")

    print_header("STRESS TEST COMPLETED - EVALUATE THE DEPTH")

if __name__ == "__main__":
    main()
