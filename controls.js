function makeControls() {

    stitchSlider = makeSlider(stitchSlider, 'Stitches', 0, validStitches.length - 1, 4, 1);
    rowSlider = makeSlider(rowSlider, 'Rows', minRows, maxRows, rows, 1);
    scaleSlider = makeSlider(scaleSlider, 'Scale', 0.1, 2.5, patternScale, 0.1);
    textureSlider = makeSlider(textureSlider, 'Texture', 0, 0.9, texture, 0.1);

    saveButton = makeButton(saveButton, 'Save image', saveImage)
}

function makeSlider(sliderName, label, min, max, defaultValue, step) {

    createElement('label', label + ' · <span class=' + label + '></span>').parent('controls').attribute('for', label);

    sliderName = createSlider(min, max, defaultValue, step);
    sliderName.id(label);
    sliderName.parent('controls');
    sliderName.class('form-control-range mb-3 slider');

    return sliderName;
}

function makeButton(buttonName, text, action) {

    buttonName = createButton(text);
    buttonName.parent('controls');
    buttonName.class('btn btn-outline-light btn-block mt-5');
    buttonName.mousePressed(action);

    return buttonName;
}

function saveImage() {

    const filename = stitches + '-sts-' + rows + '-rows';
    saveCanvas(filename, 'png');
}

function bulkSaveImages(range) {

    range += 1;
    const originalRows = rows;

    for (let i = minRows; i < maxRows + 1; i++) {

        if (!range || (i < originalRows + range && i > originalRows - range)) {

            rowSlider.value(i);
            draw();
            saveImage();
        }
    }
    rowSlider.value(originalRows);
}
