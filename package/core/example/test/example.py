import sys

import matplotlib.pyplot as plt
import numpy as np

if __name__ == "__main__":
    args = sys.argv[1:]
    array = []
    with open(
        r"D:/project/geolocus/package/core/example/example.csv",
        "r",
        encoding="utf8",
    ) as f:
        for line in f.readlines():
            content = line.removesuffix("\n").split(",")
            array.append(content)

    xMin, yMin, xMax, yMax = array[0]
    coord = array[1]
    row, col, _ = array[2]
    grid = np.zeros((int(row), int(col)))

    for i in range(3, len(array)):
        y, x, z = array[i]
        grid[int(y)][int(x)] = float(z)

    plt.imshow(
        grid,
        cmap="jet",
        origin="lower",
        extent=(float(xMin), float(xMax), float(yMin), float(yMax)),
        interpolation=None,
    )

    for arg in args:
        if "point" in arg:
            for index in range(0, len(coord), 2):
                plt.scatter(
                    float(coord[index]),
                    float(coord[index + 1]),
                    color="#2DD700",
                )

    plt.show()
