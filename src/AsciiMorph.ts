/**
 * Ascii Morph
 * @author: Tim Holman (https://tholman.com)
 *
 * Edited into class w/ TypeScript by
 *  Kelley van Evert (https://klve.nl/)
 */
import { version } from "../package.json";

export default class AsciiMorph {
  version = version;

  renderedData: string[] = [];
  framesToAnimate: string[][] = [];
  myTimeout?: any;

  constructor(
    public element: HTMLPreElement,
    public canvasDimensions: { x: number; y: number }
  ) {}

  private squareOutData(data: string[]) {
    let renderDimensions = {
      x: 0,
      y: data.length,
    };

    // Calculate centering numbers
    for (let i = 0; i < data.length; i++) {
      if (data[i].length > renderDimensions.x) {
        renderDimensions.x = data[i].length;
      }
    }

    // Pad out right side of data to square it out
    for (let i = 0; i < data.length; i++) {
      if (data[i].length < renderDimensions.x) {
        data[i] = data[i] + repeat(" ", renderDimensions.x - data[i].length);
      }
    }

    const paddings = {
      x: Math.floor((this.canvasDimensions.x - renderDimensions.x) / 2),
      y: Math.floor((this.canvasDimensions.y - renderDimensions.y) / 2),
    };

    // Left Padding
    for (let i = 0; i < data.length; i++) {
      data[i] = repeat(" ", paddings.x) + data[i] + repeat(" ", paddings.x);
    }

    // Pad out the rest of everything
    for (let i = 0; i < this.canvasDimensions.y; i++) {
      if (i < paddings.y) {
        data.unshift(repeat(" ", this.canvasDimensions.x));
      } else if (i > paddings.y + renderDimensions.y) {
        data.push(repeat(" ", this.canvasDimensions.x));
      }
    }

    return data;
  }

  // Crushes the frame data by 1 unit.
  private getMorphedFrame(data: string[]) {
    let firstInLine: null | number = null;
    let lastInLine: null | number = null;

    let found = false;
    for (let i = 0; i < data.length; i++) {
      let line = data[i];
      firstInLine = line.search(/\S/);
      if (firstInLine === -1) {
        firstInLine = null;
      }

      for (let j = 0; j < line.length; j++) {
        if (line[j] != " ") {
          lastInLine = j;
        }
      }

      if (firstInLine !== null && lastInLine !== null) {
        data = this.crushLine(data, i, firstInLine, lastInLine);
        found = true;
      }

      firstInLine = null;
      lastInLine = null;
    }

    if (found) {
      return data;
    } else {
      return false;
    }
  }

  private crushLine(data: string[], line: number, start: number, end: number) {
    const centers = {
      x: Math.floor(this.canvasDimensions.x / 2),
      y: Math.floor(this.canvasDimensions.y / 2),
    };

    let crushDirection = 1;
    if (line > centers.y) {
      crushDirection = -1;
    }

    data[line] = replaceAt(data[line], start, " ");
    data[line] = replaceAt(data[line], end, " ");

    if (!(end - 1 == start + 1) && !(start === end) && !(start + 1 === end)) {
      data[line + crushDirection] = replaceAt(
        data[line + crushDirection],
        start + 1,
        "+*/\\".substr(Math.floor(Math.random() * "+*/\\".length), 1)
      );
      data[line + crushDirection] = replaceAt(
        data[line + crushDirection],
        end - 1,
        "+*/\\".substr(Math.floor(Math.random() * "+*/\\".length), 1)
      );
    } else if (
      (start === end || start + 1 === end) &&
      line + 1 !== centers.y &&
      line - 1 !== centers.y &&
      line !== centers.y
    ) {
      data[line + crushDirection] = replaceAt(
        data[line + crushDirection],
        start,
        "+*/\\".substr(Math.floor(Math.random() * "+*/\\".length), 1)
      );
      data[line + crushDirection] = replaceAt(
        data[line + crushDirection],
        end,
        "+*/\\".substr(Math.floor(Math.random() * "+*/\\".length), 1)
      );
    }

    return data;
  }

  public render(data: string[]) {
    const ourData = this.squareOutData(data.slice());
    this.renderSquareData(ourData);
  }

  private renderSquareData(data: string[]) {
    this.element.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      this.element.innerHTML = this.element.innerHTML + data[i] + "\n";
    }

    this.renderedData = data;
  }

  // Morph between whatever is current, to the new frame
  public morph(data: string[]) {
    clearTimeout(this.myTimeout);
    const frameData = this.prepareFrames(data.slice());
    this.animateFrames(frameData);
  }

  private prepareFrames(data: string[]) {
    const deconstructionFrames = [];
    const constructionFrames = [];

    let clonedData = this.renderedData;

    // If its taking more than 100 frames, its probably somehow broken
    // Get the deconscrution frames
    for (let i = 0; i < 100; i++) {
      const newData = this.getMorphedFrame(clonedData);
      if (newData === false) {
        break;
      }
      deconstructionFrames.push(newData.slice(0));
      clonedData = newData;
    }

    // Get the constuction frames for the new data
    let squareData = this.squareOutData(data);
    constructionFrames.unshift(squareData.slice(0));
    for (let i = 0; i < 100; i++) {
      const newData = this.getMorphedFrame(squareData);
      if (newData === false) {
        break;
      }
      constructionFrames.unshift(newData.slice(0));
      squareData = newData;
    }

    return deconstructionFrames.concat(constructionFrames);
  }

  private animateFrames(frameData: string[][]) {
    this.framesToAnimate = frameData;
    this.animateFrame();
  }

  private animateFrame() {
    this.myTimeout = setTimeout(() => {
      this.renderSquareData(this.framesToAnimate[0]);
      this.framesToAnimate.shift();
      if (this.framesToAnimate.length > 0) {
        this.animateFrame();
      }
    }, 20);

    // framesToAnimate
  }
}

/**
 * Utils
 */

function repeat(pattern: string, count: number) {
  if (count < 1) return "";
  let result = "";
  while (count > 1) {
    if (count & 1) result += pattern;
    (count >>= 1), (pattern += pattern);
  }
  return result + pattern;
}

function replaceAt(string: string, index: number, character: string) {
  return (
    string.substr(0, index) +
    character +
    string.substr(index + character.length)
  );
}
