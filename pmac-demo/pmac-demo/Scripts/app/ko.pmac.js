/*
The MIT License (MIT) - http://www.opensource.org/licenses/mit-license.php
Copyright (c) Author: Anas Karkoukli
*/

(function () {
    "use strict";

    function autoComplete(settings) {
        var $this = this;
        var selectedCallbacks = [];
        var selectedIndex = -1;
        this.results = ko.observableArray([]);
        this.visible = ko.computed(function () {
            return $this.results().length > 0;
        });
        this.query = ko.observable("").extend({ throttle: settings.throttle });
        this.query.subscribe(function (value) {
            if (value === '' || value == null) {
                $this.results([]);
                return;
            }
            $.getJSON(settings.url + '/' + value)
	            .then(function (data) {
	                $this.results(data.map(function (_) {
	                    return { value: _.value, name: _.name, selected: ko.observable(false) };
	                }));
	            });
        });

        var highlightSuggestion = function () {
            $this.results().forEach(function (_, i) { _.selected(selectedIndex === i); });
        };
        this.nextSuggestion = function () {
            selectedIndex = Math.min(++selectedIndex, $this.results().length - 1);
            highlightSuggestion();
        };
        this.previousSuggestion = function () {
            selectedIndex = Math.max(--selectedIndex, 0);
            highlightSuggestion();
        };
        this.addSelectedEventListener = function (listener) {
            selectedCallbacks.push(listener);
        };
        this.select = function (data) {
            var suggestion = data || $this.results()[selectedIndex];
            if (!suggestion) return;
            $this.reset();
            selectedCallbacks.forEach(function (_) { _(suggestion); });
        };
        this.reset = function () {
            $this.results.removeAll();
            selectedIndex = -1;
        };
    };

    ko.bindingHandlers['auto-complete'] = {
        init: function (element, valueAccessor) {
            var settings = valueAccessor() || {};

            var autoCompleteViewModel = new autoComplete(settings);
            if (settings.selectedCallback)
                autoCompleteViewModel.addSelectedEventListener(settings.selectedCallback);

            var $input = $('<input />', {
                'placeHolder': settings.placeHolder,
                'class': settings.css.input,
                blur: function () {
                    autoCompleteViewModel.reset();
                }
            }).appendTo($(element));

            var $ul = $('<ul><li data-bind=\'text: $data.name, event: {mousedown: $parent.select}, css: {"selected": $data.selected}\'></li></ul>')
				.addClass(settings.css.list)
				.appendTo($(element));

            ko.applyBindingsToNode($ul[0], {
                foreach: autoCompleteViewModel.results,
                visible: autoCompleteViewModel.visible
            }, autoCompleteViewModel);

            autoCompleteViewModel.addSelectedEventListener(function (selection) {
                $input.val(selection.name);
                $input.trigger('blur');
            });

            var keys = { escape: 27, up: 38, down: 40, enter: 13 };
            $input.keyup(function (event) {
                switch (event.keyCode) {
                    case keys.escape:
                        autoCompleteViewModel.reset();
                        break;
                    case keys.down:
                        autoCompleteViewModel.nextSuggestion();
                        break;
                    case keys.up:
                        autoCompleteViewModel.previousSuggestion();
                        break;
                    default:
                        autoCompleteViewModel.query($(this).val());
                }
            });

            $input.keydown(function (event) {
                if (event.keyCode === keys.enter) autoCompleteViewModel.select();
            });
        }
    };
})();