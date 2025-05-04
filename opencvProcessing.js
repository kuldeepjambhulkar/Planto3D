import { addRectangle } from "./threejsProcessing.js";
import { toggleSpinner } from "./UIProcessing.js";

export function processImageWithOpenCV(img) {
  let canvas = document.createElement("canvas");
  canvas.id = "uploadedImage";
  canvas.className = "centered-canvas";
  canvas.style.maxWidth = "900px";
  canvas.style.visibility = "hidden";
  document.body.appendChild(canvas);

  let ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let binary = new cv.Mat();
  let edges = new cv.Mat();

  convertToGrayscale(src, gray);
  applyThresholding(gray, binary);
  detectEdges(binary, edges);

  let floorPlanData = { walls: [], doors: [], windows: [] };
  detectWalls(src, edges, floorPlanData);
  detectContours(src, binary, floorPlanData);

  toggleSpinner();
  cv.imshow("uploadedImage", src);
  setTimeout(() => {
    canvas.remove();
    addRectangle(processFloorPlanData(floorPlanData));
  }, 200);

  cleanup(src, gray, binary, edges);
}

function convertToGrayscale(src, gray) {
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
}

function applyThresholding(gray, binary) {
  cv.threshold(gray, binary, 200, 255, cv.THRESH_BINARY_INV);
}

function detectEdges(binary, edges) {
  cv.Canny(binary, edges, 50, 150, 3);
}

function detectWalls(src, edges, floorPlanData) {
  let lines = new cv.Mat();
  cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 50, 5);

  for (let i = 0; i < lines.rows; i++) {
    let x1 = lines.intPtr(i, 0)[0];
    let y1 = lines.intPtr(i, 0)[1];
    let x2 = lines.intPtr(i, 0)[2];
    let y2 = lines.intPtr(i, 0)[3];
    let length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    floorPlanData.walls.push({ x1, y1, x2, y2, length });
    cv.line(
      src,
      new cv.Point(x1, y1),
      new cv.Point(x2, y2),
      [0, 255, 0, 255],
      2
    );
  }

  lines.delete();
}

function detectContours(src, binary, floorPlanData) {
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    binary,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );

  for (let i = 0; i < contours.size(); i++) {
    let rect = cv.boundingRect(contours.get(i));

    if (
      rect.width > 30 &&
      rect.width < 100 &&
      rect.height > 10 &&
      rect.height < 50
    ) {
      floorPlanData.windows.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
      cv.rectangle(
        src,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        [255, 0, 0, 255],
        2
      );
    } else if (
      rect.width > 50 &&
      rect.width < 200 &&
      rect.height > 10 &&
      rect.height < 80
    ) {
      floorPlanData.doors.push({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
      cv.rectangle(
        src,
        new cv.Point(rect.x, rect.y),
        new cv.Point(rect.x + rect.width, rect.y + rect.height),
        [0, 0, 255, 255],
        2
      );
    }
  }

  contours.delete();
  hierarchy.delete();
}

function cleanup(src, gray, binary, edges) {
  src.delete();
  gray.delete();
  binary.delete();
  edges.delete();
}

function centerFloorPlan(floorPlanData) {
  const { walls, doors = [], windows = [] } = floorPlanData;

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  const updateBounds = (x1, y1, x2, y2) => {
    minX = Math.min(minX, x1, x2);
    minY = Math.min(minY, y1, y2);
    maxX = Math.max(maxX, x1, x2);
    maxY = Math.max(maxY, y1, y2);
  };

  [...walls, ...doors, ...windows].forEach((item) => {
    updateBounds(item.x1, item.y1, item.x2, item.y2);
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const scaleFactor = 4; // Adjust this value to control the spacing

  const transformItem = ({ x1, y1, x2, y2, ...rest }) => ({
    x1: (x1 - centerX) * scaleFactor,
    y1: -(y1 - centerY) * scaleFactor, // Invert and scale the Y-coordinate
    x2: (x2 - centerX) * scaleFactor,
    y2: -(y2 - centerY) * scaleFactor, // Invert and scale the Y-coordinate
    ...rest,
  });

  return {
    walls: walls.map(transformItem),
    doors: doors.map(transformItem),
    windows: windows.map(transformItem),
    center: { x: centerX, y: centerY },
    dimensions: {
      width: (maxX - minX) * scaleFactor,
      height: (maxY - minY) * scaleFactor,
    },
  };
}

function filterInnerEdges(walls) {
  const threshold = 20;
  const grouped = [];
  const used = new Array(walls.length).fill(false);

  const isHorizontal = (w) => Math.abs(w.y1 - w.y2) < 5;
  const isVertical = (w) => Math.abs(w.x1 - w.x2) < 5;

  for (let i = 0; i < walls.length; i++) {
    if (used[i]) continue;

    const current = walls[i];
    const group = [current];
    used[i] = true;

    for (let j = i + 1; j < walls.length; j++) {
      if (used[j]) continue;
      const other = walls[j];

      if (isHorizontal(current) && isHorizontal(other)) {
        // Check if they span the same horizontal range
        if (
          Math.abs(current.x1 - other.x1) < threshold &&
          Math.abs(current.x2 - other.x2) < threshold &&
          Math.abs(current.y1 - other.y1) < threshold
        ) {
          group.push(other);
          used[j] = true;
        }
      }

      if (isVertical(current) && isVertical(other)) {
        // Check if they span the same vertical range
        if (
          Math.abs(current.y1 - other.y1) < threshold &&
          Math.abs(current.y2 - other.y2) < threshold &&
          Math.abs(current.x1 - other.x1) < threshold
        ) {
          group.push(other);
          used[j] = true;
        }
      }
    }

    if (group.length === 1) {
      grouped.push(group[0]); // only one, keep it
    } else {
      const horizontal = isHorizontal(group[0]);

      // Sort to pick the "interior" one
      group.sort((a, b) => {
        return horizontal
          ? a.y1 - b.y1 // lower y is higher up = interior
          : b.x1 - a.x1; // higher x is more rightward = interior
      });

      grouped.push(group[0]); // keep the inner one
    }
  }

  console.log("Filtered walls:", grouped);
  return grouped;
}

function processFloorPlanData(floorPlanData) {
  // Filter out inner edges
  floorPlanData.walls = filterInnerEdges(floorPlanData.walls);

  // Center the floor plan
  return centerFloorPlan(floorPlanData);
}
