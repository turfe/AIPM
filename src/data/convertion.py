import json

def convert_clothes_to_products(input_file, output_file):
	with open(input_file, 'r') as infile:
		clothes_data = json.load(infile)
	
	products = []
	for idx, item in enumerate(clothes_data['item'], start=1):
		try:
			prize = item['prize']
			price = float(prize.replace('£', '').replace(',', '')) if prize else 0.0
		except Exception as e:
			print(f"Error parsing price for item {item}")
			price = 0.0
		product = {
			"id": str(idx),
			"name": item.get("name", "Unnamed Product"),
			"price": price,
			"description": item.get("description", "").split("\n", 1)[1].strip() if "\n" in item.get("description", "") else item.get("description", ""),
			"imageUrl": item.get("img1", ""),
			"brand": item.get("name", "").split()[0] if item.get("name") else "Unknown",
			"size": item.get("name", "").split('-')[1].strip() if '-' in item.get("name", "") else "Unknown",
			"condition": "Good",
			"externalUrl": item.get("url", "")
		}
		if "CONDITION" in item.get("description", ""):
			lines = item["description"].split('\n')
			for line in lines:
				if line.startswith("CONDITION:"):
					product["condition"] = line.split(":", 1)[1].strip().capitalize()
					break
		products.append(product)
	
	with open(output_file, 'w') as outfile:
		outfile.write("import { Product } from '../types/product';\n\n")
		outfile.write("export const products: Product[] = ")
		json.dump(products, outfile, indent=2)
		outfile.write(";")

convert_clothes_to_products('clothes_info.json', 'full_products.ts')
