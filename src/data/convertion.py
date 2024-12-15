import json
import re

def normalize_condition(condition):
    """
    Normalize condition descriptions to one or two words, capitalize first letters.
    """
    condition_mapping = {
        "good": "Good",
        "very good": "Very Good",
        "bad": "Bad",
        "very bad": "Very Bad"
    }
    for key, value in condition_mapping.items():
        if key in condition.lower():
            return value
    return "Unknown"

def extract_size(description):
    """
    Extract size details like WAIST, INSEAM, and construct a size field.
    """
    waist_match = re.search(r"WAIST:\s*(\d+)", description)
    inseam_match = re.search(r"INSEAM:\s*(\d+)", description)
    size_conversion_match = re.search(r"Size conversion:\nUS Size:\s*(\d+)", description)

    sizes = []
    if waist_match:
        sizes.append(f"{waist_match.group(1)}W")
    if inseam_match:
        sizes.append(f"{inseam_match.group(1)}L")
    if not sizes and size_conversion_match:
        sizes.append(f"{size_conversion_match.group(1)}US")

    return " ".join(sizes) if sizes else "Unknown"

def convert_clothes_to_products(input_file, output_file):
    with open(input_file, 'r') as infile:
        clothes_data = json.load(infile)
    
    products = []
    for idx, item in enumerate(clothes_data['item']):
        # Process the condition
        condition_line = next(
            (line for line in item.get("description", "").split('\n') if line.startswith("CONDITION:")),
            "CONDITION: Unknown"
        )
        condition = normalize_condition(condition_line.split(":", 1)[1].strip())

        images = []
        img_keys = ['img1', 'img2', 'img3']
        for i, key in enumerate(img_keys, start=1):
            img_url = item.get(key)
            if img_url:
                images.append({
                    "url": img_url,
                    "alt": f"Image {i}"
                })

        product = {
            "id": str(idx),
            "name": item.get("name", "").split("-")[0].strip(),
            "price": round(float(item.get("prize", "£0").replace('£', '').replace(',', '')) / 1.13, 2),
            "description": item.get("description", ""),
            "images": images,
            "brand": item.get("name", "").split()[0] if item.get("name") else "Unknown",
            "size": item.get("name", "").split('-')[1].strip() if '-' in item.get("name", "") else "Unknown",
            "condition": condition,
            "externalUrl": item.get("url", "")
        }
        products.append(product)
    
    # Write to TypeScript file
    with open(output_file, 'w') as outfile:
        outfile.write("import { Product } from '../types/product';\n\n")
        outfile.write("export const products: Product[] = ")
        json.dump(products, outfile, indent=2)
        outfile.write(";")

# Example usage
convert_clothes_to_products('clothes_info.json', 'full_products.ts')
