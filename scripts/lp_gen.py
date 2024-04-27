import random
import pyperclip

# Generate a complex list of LPs
random.seed(42)  # for reproducibility

# Generate 20 LPs with random fees and amounts
LPs_complex_generated = [
    (f"LP{i+1}", round(random.uniform(0.01, 1000), 2), round(random.uniform(0.01, 5), 2) ) 
    for i in range(20)
]

LPs_complex_generated

pyperclip.copy(str(LPs_complex_generated))
