import re

# 1. Update Header.jsx to group burger and logo
with open('src/components/Header.jsx', 'r') as f:
    content = f.read()

header_search = r'(<button\s+className="moss-burger".*?<\/button>)\s*(\{/\* Logo \(fade in al hacer scroll\) \*/\})\s*(<Link to="/" onClick=\{.*?\} style=\{\{ display: \'flex\', alignItems: \'center\', zIndex: 1 \}\} aria-label="Home">\s*<motion\.img\s+src="/brand/logotipo-tulum\.svg"\s+alt="Tulum"\s+style=\{\{ height: \'36px\', marginLeft: \'12px\', opacity: logoOpacity \}\}\s+animate=\{\{ filter: logoFilter \}\}\s+transition=\{\{ duration: 0\.3 \}\}\s+/>\s*<\/Link>)'
header_replace = r'<div style={{ display: \'flex\', alignItems: \'center\', gap: \'12px\' }}>\n        \1\n        \2\n        \3\n        </div>'

new_content = re.sub(header_search, header_replace, content, flags=re.DOTALL)

with open('src/components/Header.jsx', 'w') as f:
    f.write(new_content)

# 2. Update MossMenu.css to slide from left
with open('src/components/MossMenu.css', 'r') as f:
    css = f.read()

css = css.replace('right: 0;\n  height: 100svh;', 'left: 0;\n  height: 100svh;')
css = css.replace('transform: translateX(100%);', 'transform: translateX(-100%);')
css = css.replace('left: 0;\n  width: 200%;', 'right: 0;\n  left: auto;\n  width: 200%;')
css = css.replace('transform: translate(-8%, -50%);', 'transform: translate(8%, -50%);')

with open('src/components/MossMenu.css', 'w') as f:
    f.write(css)
