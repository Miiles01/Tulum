with open('src/components/Header.jsx', 'r') as f:
    text = f.read()

text = text.replace("<div style={{ display: \\'flex\\', alignItems: \\'center\\', gap: \\'12px\\' }}>", "<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>")

with open('src/components/Header.jsx', 'w') as f:
    f.write(text)
