import os
import zipfile

output_zip = 'public/zakir-smart-project.zip'

# Remove existing zip if any
if os.path.exists(output_zip):
    try:
        os.remove(output_zip)
    except Exception:
        pass

exclude_dirs = {'node_modules', '.git', 'dist', '.aistudio', '.cache', '__pycache__'}
exclude_extensions = {'.pyc'}

count = 0
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        
        for file in sorted(files):
            if file.startswith('.') or file.endswith('.zip'):
                continue
            
            ext = os.path.splitext(file)[1]
            if ext in exclude_extensions:
                continue

            file_path = os.path.join(root, file)
            # relative path for archive
            arcname = os.path.relpath(file_path, '.')
            zf.write(file_path, arcname)
            count += 1

print(f"Packaged {count} files successfully into {output_zip}")
print(f"File size: {os.path.getsize(output_zip) / 1024:.2f} KB")
