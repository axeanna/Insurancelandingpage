import fitz
import os
import glob

pdf_dir = r"C:\Users\User\Desktop\PDF FOR REFERENCE"
output_dir = r"C:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\extracted_faqs"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for pdf_path in glob.glob(os.path.join(pdf_dir, "*.pdf")):
    filename = os.path.basename(pdf_path)
    if "FAQ" in filename or "Flyer" in filename or "Leaflet" in filename:
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            
            out_name = filename.replace(".pdf", ".txt")
            with open(os.path.join(output_dir, out_name), "w", encoding="utf-8") as f:
                f.write(text)
            print(f"Extracted {filename}")
        except Exception as e:
            print(f"Error on {filename}: {e}")

print("Done extracting.")
