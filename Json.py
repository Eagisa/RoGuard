import json

def minify_json(input_file, output_file):
    # Read the well-formatted JSON data
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Minify JSON (make it one line without spaces or newlines)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))  # Minified JSON with no spaces

    print(f"Minified JSON saved to: {output_file}")

# Example usage
minify_json("Flagged_Accounts.json", "minified_data.json")
