import sys
try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Please install Pillow to process the image.")
    sys.exit(1)

def process_logo():
    print("Loading image...")
    # Open the image and convert to RGBA
    img = Image.open(r"e:\星火\public\xinghuologo.png").convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        lum = 0.299 * item[0] + 0.587 * item[1] + 0.114 * item[2]
        
        if lum > 235:
            # Pure transparent
            newData.append((item[0], item[1], item[2], 0))
        elif lum > 160:
            # Soft edge alpha blending
            alpha = int(255 * (235 - lum) / (235 - 160))
            newData.append((item[0], item[1], item[2], alpha))
        else:
            # Keep original stroke solid
            newData.append((item[0], item[1], item[2], 255))
            
    img.putdata(newData)
    img.save(r"e:\星火\public\xinghuologo_trans.png", "PNG")
    print("Successfully removed background and saved to xinghuologo_trans.png!")

if __name__ == '__main__':
    process_logo()
