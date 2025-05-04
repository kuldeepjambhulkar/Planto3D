import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js";

// Rectangle class to encapsulate all rectangle-related functionality
export class Rectangle {
  constructor(width, height, position, scene) {
    this.width = width;
    this.height = height;
    this.position = position;
    this.scene = scene;

    // Create the rectangle
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshStandardMaterial({ color: 0xb6b6b6 });
    this.rectangle = new THREE.Mesh(geometry, material);
    this.rectangle.position.copy(position);
    this.rectangle.position.z = 1
    this.rectangle.renderOrder = 0;
    // Initialize properties
    this.border = null;

    // Add orange dots
    const dotGeometry = new THREE.CircleGeometry(5, 32);
    const dotMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    this.leftDot = new THREE.Mesh(dotGeometry, dotMaterial);
    this.rightDot = new THREE.Mesh(dotGeometry, dotMaterial);

    this.leftDot.position.set(-width / 2, 0, 0);
    this.rightDot.position.set(width / 2, 0, 0);

    this.leftDot.renderOrder = 1;
    this.rightDot.renderOrder = 1;

    this.leftDot.visible = false;
    this.rightDot.visible = false;

    scene.add(this.leftDot);
    scene.add(this.rightDot);

    // Add the rectangle to the scene
    this.scene.add(this.rectangle);
  }

  showDots() {
    this.leftDot.visible = true;
    this.rightDot.visible = true;
  }

  hideDots() {
    this.leftDot.visible = false;
    this.rightDot.visible = false;
  }

  // Draw a border around the rectangle
  drawBorder() {
    if (this.border) {
      this.scene.remove(this.border);
    }
    const edges = new THREE.EdgesGeometry(this.rectangle.geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    this.border = new THREE.LineSegments(edges, lineMaterial);
    this.border.position.copy(this.rectangle.position);
    this.border.rotation.copy(this.rectangle.rotation);
    this.scene.add(this.border);
  }

  // Remove the border
  removeBorder() {
    if (this.border) {
      this.scene.remove(this.border);
      this.border = null;
    }
  }

  // Drag the rectangle
  drag(intersection, offset) {
    this.rectangle.position.copy(intersection.sub(offset));
    if (this.border) {
      this.border.position.copy(this.rectangle.position);
    }
  }
}
