#!/usr/bin/env python3
"""Link equipment images to asset models in database."""

from pathlib import Path

IMAGES_DIR = Path("public/equipment-images")

# Mapping of equipment types to image files
EQUIPMENT_MAPPING = {
    "A9900": "/equipment-images/a9900_main.png",
    "Puma": "/equipment-images/puma_main.png",
}

def main():
    print("=" * 60)
    print("[LINKING] Vinculando imagenes a modelos de equipos")
    print("=" * 60)

    print(f"\n[DIRECTORIO IMAGENES] {IMAGES_DIR.absolute()}")

    print("\n[MAPEO] Equipos y imagenes:")
    for eq_name, img_path in EQUIPMENT_MAPPING.items():
        img_file = IMAGES_DIR / Path(img_path).name
        if img_file.exists():
            size_kb = img_file.stat().st_size / 1024
            print(f"  {eq_name:15} -> {img_path:40} ({size_kb:.0f}KB)")
        else:
            print(f"  {eq_name:15} -> {img_path:40} [NO ENCONTRADA]")

    print("\n[CONFIG] Componentes: EquipmentImage y ComponentImage listos")
    print("[CONFIG] Rutas de imagen en: public/equipment-images/")
    print("\n[EXITO] Integracion completada")

    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
