#!/usr/bin/env python3
import subprocess
import sys
import os

TEMPLATE_FILE = "template.html"
CMARK = "./cmark-gfm"

def run_cmark(md_file):
    """Run cmark-gfm and return HTML fragment."""
    result = subprocess.run(
        [CMARK, "-e", "table", "-e", "tasklist", "--hardbreaks", "-e", "strikethrough", md_file],
        stdout=subprocess.PIPE,
        text=True,
        check=True
    )
    return result.stdout

def load_template():
    with open(TEMPLATE_FILE, "r") as f:
        return f.read()

def build_page(md_file, html_file):
    content = run_cmark(md_file)
    template = load_template()
    title = os.path.splitext(os.path.basename(md_file))[0]

    final_html = template.replace("{{content}}", content)
    final_html = final_html.replace("{{title}}", title)

    with open(html_file, "w") as f:
        f.write(final_html)

    print(f"Generated {html_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./md2html.py input.md [output.html]")
        sys.exit(1)

    if sys.argv[1] == "-F":
        from pathlib import Path
        folder_path = Path(sys.argv[2])
        for file_path in folder_path.iterdir():
            if file_path.is_file():
                build_page(file_path.name, file_path.name.replace(".md", ".html"))
    else:
        md_file = sys.argv[1]
        html_file = sys.argv[2] if len(sys.argv) > 2 else md_file.replace(".md", ".html")

        build_page(md_file, html_file)
