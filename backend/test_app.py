import sys
import traceback
import warnings
warnings.filterwarnings('ignore')

try:
    print("Loading app...")
    from app.main import app
    print("✓ App loaded successfully!")
    print(f"App type: {type(app)}")
except Exception as e:
    print(f"✗ Error loading app:")
    traceback.print_exc()
    sys.exit(1)

print("Test completed!")
