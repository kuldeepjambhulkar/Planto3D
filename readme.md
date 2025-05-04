# Planto3D - Floor Plan to 3D Design
planto3d.netlify.app

This project is a web-based application that allows users to create and visualize floor plans in both 2D and 3D, **by uploading images of their 2D floor plans**. Users can add walls, upload floor plans, and interact with the design using drag-and-drop functionality. The application leverages Three.js for 3D rendering and provides a seamless experience for designing and visualizing spaces.

Basically, **floor plan image to 3D interactive design in one click**

## Features
- **Image to Design conversion**: Upload image of floor plan & automatically convert it into interactive 3D design  
- **2D and 3D Views**: Toggle between 2D and 3D views for better visualization.
- **Drag-and-Drop Interaction**: Move and resize walls using intuitive drag-and-drop controls.
- **Lighting and Shadows**: Realistic lighting effects for 3D visualization.
- **Responsive Design**: Works on both desktop and cellphones.

## Tech Stack
- **OpenCV** : For Image processing & object detection.
- **Three.js**: For 3D rendering and scene management.
- **JavaScript (ES6)**: Core programming language for the application.
- **HTML5**: Structure of the web application.
- **CSS3**: Styling and layout.
- **Font Awesome**: For icons used in the UI.
- **Bootstrap**: For responsive design and layout.

## How to Use

1. Load this URL : [planto3d.netlify.app](https://planto3d.netlify.app/)
2. Upload any floor plan image (preferably use the ones provided in the `ExampleFloorPlans` folder)
3. Check 3D view for 3D design

### Running the Application
1. Clone or download the repository to your local machine.
2. Open the `index.html` file in your browser.

### Interactions
- **Add Walls**: Click the "Add Wall" button to create a new wall in the scene.
- **Drag and Resize**: Use the mouse to drag walls or resize them by interacting with the orange dots.
- **Toggle Camera**: Switch between 2D and 3D views using the "3D View" button.
- **Reset Camera**: Reset the camera to its default position using the "Reset View" button.
- **Upload Floor Plan**: Use the "Upload Floorplan" button to upload an image of a floor plan.

### Controls
- **Mouse**: Hover over walls or dots to interact. Drag to move or resize elements.
- **Touch**: Pinch to zoom and drag to move elements on touch devices.
- **Keyboard**: Not currently supported.

### File Structure
- `index.html`: Entry point of the application.
- `style.css`: Contains all the styles for the application.
- `threejsProcessing.js`: Main logic for rendering and interaction using Three.js.
- `Rectangle.js`: Encapsulates the functionality for creating and managing rectangles (walls).
- `uiProcessing.js`: Handles UI interactions like modals and buttons.
- `opencvProcessing.js`: Placeholder for OpenCV-related functionality (if needed).
- `floorCovering.jpg`: Texture used for the floor.

## Future Enhancements
- Add support for saving and loading designs.
- Implement advanced snapping and alignment features.
- Add more customization options for walls and textures.
- Integrate OpenCV for advanced image processing of uploaded floor plans.
