class HandleSelectionExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this._group = null;
        this._button = null;
    }

    load() {
        console.log('HandleSelectionExtension has been loaded');
        return true;
    }

    unload() {
        // Clean our UI elements if we added any
        if (this._group) {
            this._group.removeControl(this._button);
            if (this._group.getNumberOfControls() === 0) {
                this.viewer.toolbar.removeControl(this._group);
            }
        }
        console.log('HandleSelectionExtension has been unloaded');
        return true;
    }

    onToolbarCreated() {
        // Create a new toolbar group if it doesn't exist
        this._group = this.viewer.toolbar.getControl('allMyAwesomeExtensionsToolbar');
        if (!this._group) {
            this._group = new Autodesk.Viewing.UI.ControlGroup('allMyAwesomeExtensionsToolbar');
            this.viewer.toolbar.addControl(this._group);
        }

        // Add a new button to the toolbar group
        this._button = new Autodesk.Viewing.UI.Button('handleSelectionExtensionButton');
        this._button.onClick = (ev) => {
            console.log('A click has been made')
            // Get current selection
            const selection = this.viewer.getSelection();
            this.viewer.clearSelection();
            // Anything selected?
            if (selection.length > 0) {
                let isolated = [];
                // Iterate through the list of selected dbIds
                selection.forEach((dbId) => {
                    // Get properties of each dbId
                    this.viewer.getProperties(dbId, (props) => {
                        // Output properties to console
                        console.log(props);
                        // Ask if want to isolate
                        if (confirm(`Isolate ${props.name} (${props.externalId})?`)) {
                            isolated.push(dbId);
                            this.viewer.isolate(isolated);
                        }
                    });
                });
            } else {
                // If nothing selected, restore
                this.viewer.isolate(0);
            }

            };
        this._button.setToolTip('Handle Selection Extension');
        this._button.addClass('handleSelectionExtensionIcon');
        this._group.addControl(this._button);
    }
}

Autodesk.Viewing.theExtensionManager.registerExtension('HandleSelectionExtension', HandleSelectionExtension);


// .getSelection() returns an array of dbId from the model, and .clearSelection()
// .getProperties() is an asynchronous method that returns all properties for a given dbId via callback, which is widelly used on Viewer, learn more about callbacks
// .isolate() method makes all other elements transparent ("ghosted")
// .forEach() to iterate through a collection, this is a JavaScript feature, learn more
// .push() to to include items on an array, learn more