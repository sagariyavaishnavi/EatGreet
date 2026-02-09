import re

with open('frontend/src/pages/admin/AdminOrders.jsx', 'r') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    # Ignore comments
    if line.strip().startswith('//'):
        continue
    opens = len(re.findall(r'<div', line))
    closes = len(re.findall(r'</div>', line))
    balance += opens - closes

print(f"Final Balance: {balance}")
