#!/usr/bin/env python3
import sys
import base64
import os

def convert(swf_path):
    if not os.path.exists(swf_path):
        print(f"❌ File not found: {swf_path}")
        return

    with open(swf_path, 'rb') as f:
        data = f.read()

    b64 = base64.b64encode(data).decode('utf-8')
    
    # output txt file same name as swf
    out_path = os.path.splitext(swf_path)[0] + '.txt'
    with open(out_path, 'w') as f:
        f.write(b64)

    size_kb = len(data) / 1024
    size_b64_kb = len(b64) / 1024
    print(f"✓ {os.path.basename(swf_path)}")
    print(f"  SWF:    {size_kb:.1f} KB")
    print(f"  Base64: {size_b64_kb:.1f} KB")
    print(f"  Saved:  {out_path}")

if len(sys.argv) < 2:
    print("Usage: python3 swf_to_base64.py game.swf")
    print("       python3 swf_to_base64.py *.swf   (multiple)")
else:
    for path in sys.argv[1:]:
        convert(path)