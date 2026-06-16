#!/usr/bin/env python3
"""Extract equipment images from manuals and remove backgrounds."""

import os
import sys
from pathlib import Path
import pdfplumber
from PIL import Image
import io
from rembg import remove
import json

MANUALS_DIR = r"C:\Users\raulo\OneDrive\Escritorio\ANTIGRAVITY\PLAN DE MANTENIMIENTO\ANEXOS"
OUTPUT_DIR = Path("public/equipment-images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MANUAL_FILES = {
    "A9900": "Manual del Operador A9900.pdf",
    "PUMA": "Manual del Operario Puma 165 - 180 - 195 - 210.pdf"
}

def extract_images_from_pdf(pdf_path, equipment_type):
    """Extract all images from PDF."""
    images_data = []
    pdf_full_path = Path(MANUALS_DIR) / pdf_path

    if not pdf_full_path.exists():
        print(f"[ERROR] PDF no encontrado: {pdf_full_path}")
        return images_data

    print(f"\n[PROCESANDO] Extrayendo imagenes de: {pdf_path}")

    try:
        with pdfplumber.open(pdf_full_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"[INFO] Total de paginas: {total_pages}")

            for page_num, page in enumerate(pdf.pages, 1):
                # Extract images from page
                for img_num, img in enumerate(page.images, 1):
                    try:
                        # Get image data
                        image_obj = img["srcsize"]
                        x0, top, x1, bottom = img["x0"], img["top"], img["x1"], img["bottom"]

                        # Crop image from PDF
                        cropped = page.crop((x0, top, x1, bottom)).to_image(resolution=300)

                        if cropped:
                            filename = f"{equipment_type.lower()}_p{page_num}_img{img_num}.png"
                            filepath = OUTPUT_DIR / filename

                            # Save original
                            cropped.save(filepath, "PNG")

                            # Remove background
                            remove_background(filepath)

                            images_data.append({
                                "equipment": equipment_type,
                                "page": page_num,
                                "image": img_num,
                                "file": filename,
                                "removed_bg": True
                            })

                            print(f"  [OK] Pagina {page_num}: Imagen {img_num} -> {filename}")
                    except Exception as e:
                        print(f"  [WARN] Error procesando imagen en pagina {page_num}: {str(e)}")
    except Exception as e:
        print(f"[ERROR] Error al procesar PDF: {str(e)}")

    return images_data

def remove_background(image_path):
    """Remove background from image using rembg."""
    try:
        input_path = image_path

        # Load image
        img = Image.open(input_path).convert('RGBA')

        # Remove background
        output = remove(img)

        # Save with transparency
        output.save(input_path, "PNG")

        # Get file size reduction
        size_before = os.path.getsize(input_path)
        return True
    except Exception as e:
        print(f"    ⚠ Error removiendo fondo: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("[EXTRACCION] Extrayendo imagenes de manuales de equipos")
    print("=" * 60)

    all_images = {}

    for equipment_type, manual_file in MANUAL_FILES.items():
        images = extract_images_from_pdf(manual_file, equipment_type)
        all_images[equipment_type] = images
        print(f"\n[OK] {equipment_type}: {len(images)} imagenes extraidas")

    # Save metadata
    metadata_file = OUTPUT_DIR / "metadata.json"
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(all_images, f, indent=2, ensure_ascii=False)

    print(f"\n[GUARDADAS] Imagenes en: {OUTPUT_DIR.absolute()}")
    print(f"[METADATA] En: {metadata_file}")
    print("\n[COMPLETADO] Extraccion finalizada!")

if __name__ == "__main__":
    main()
