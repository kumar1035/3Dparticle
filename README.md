# 3D Particle System - Hand Gesture Control

## 🎨 New UI design

The interface has been completely redesigned with an attractive **pink-purple gradient theme** featuring:

- ✨ **Glowing gradient borders** with pink and purple accents
- 🌟 **Animated shimmer effects** on hover
- 💫 **Pulsing status indicators** with glow effects
- 🎆 **Active template highlighting** with animated glow
- 🔮 **Glassmorphic panels** with enhanced transparency

## 🙌 Auto-Hide UI Feature

**The UI now automatically hides when you use hand gestures!**

### How it works:
- When your hands are detected by the camera, the UI panels **automatically fade out**
- When you remove your hands, the UI panels **fade back in**
- This gives you a completely clear view of the particles while using gestures

### Manual Controls:
- **Click the eye button** (👁️) in the top-right corner to manually toggle UI
- **Press H key** to quickly hide/show the UI
- When manually hidden, auto-hide is disabled

## 🎮 Controls

### Hand Gestures:
- **🤏 Pinch/Spread** (thumb-index distance): Expand/contract particles
- **✋ Hand Height** (vertical position): Change particle colors
- **🖐️ Finger Count** (1-5 fingers): Switch between templates
- **🔄 Hand Rotation** (palm orientation): Rotate particle system

### Mouse Controls (Fallback):
- **Move mouse**: Change color and rotation
- **Scroll wheel**: Expand/contract particles
- **Press 1-8**: Switch templates directly

### Keyboard Shortcuts:
- **H**: Toggle UI visibility
- **1-8**: Switch to specific template

## 🎆 Available Templates

1. **Sphere** - Dynamic sphere with golden angle distribution
2. **Heart** - 3D parametric heart shape
3. **Flow** - Flowing wave patterns
4. **Saturn** - Planet with ring system
5. **Fireworks** - Explosive radial bursts
6. **Helix** - DNA-like double helix
7. **Cube** - 3D cubic distribution
8. **Galaxy** - Spiral galaxy formation

## 🚀 How to Run

```bash
# Start local server
cd "c:\Users\kumar\Desktop\3D PARTICLE"
python -m http.server 8000

# Open browser
http://localhost:8000
OR 

Install "Live Server" 
Right-click on 
index.html
Select "Open with Live Server"
```

## 💡 Tips

- Allow camera access when prompted for hand gesture control
- The UI will automatically hide when you start using gestures
- Use the H key for quick UI toggle during demonstrations
- Try different templates with different hand gestures for amazing effects!

---

**Enjoy your interactive 3D particle system! 🎉**
