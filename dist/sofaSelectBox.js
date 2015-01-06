/**
 * angular-sofa-select-box - v0.1.0 - Tue Jan 06 2015 15:52:00 GMT+0100 (CET)
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO)
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (angular) {
angular.module('sofa-select-box.tpl.html', []).run(['$templateCache', function($templateCache) {
  $templateCache.put('sofa-select-box.tpl.html',
    '<div class="sofa-select-box">\n' +
    '    <span class="sofa-select-box__value" ng-class="{\'sofa-select-box__value--choose\': !model && chooseText}" ng-bind="displayFn(model) || chooseText"></span>\n' +
    '    <i class="sofa-select-box__icon"></i>\n' +
    '    <select sofa-name="propertyName"\n' +
    '            ng-required="{{required}}"\n' +
    '            class="sofa-select-box__native"\n' +
    '            ng-model="model"\n' +
    '            ng-options="displayFn(val) for val in data">\n' +
    '        <option ng-if="chooseText" value="">-- {{chooseText}} --</option>\n' +
    '    </select>\n' +
    '</div>');
}]);

angular.module('sofa.selectBox', ['sofa-select-box.tpl.html', 'sofa.name']);

/**
* Creates a mobile friendly select box that delegates to the native picker
*
* Options:
*
*   -   `displayValueExp` optional expression that maps values to display values.
*       Can either be a string (e.g. 'some.nested.property') or a function
*       (e.g. function(value){ return value.some.nested.property; })
*/
angular.module('sofa.selectBox')
    .directive('sofaSelectBox', function() {

        'use strict';

        // a) "ngModel compares by reference, not value. This is important when binding to an array of objects."
        // b) Regardless of data type also check whether the given model exists within the options-data
        var mapModelToData = function (scope) {
            if (scope.model) {
                var modelInData = false;

                for(var i = 0; i < scope.data.length; i++) {
                    if (angular.equals(scope.data[i], scope.model)) {
                        scope.model = scope.data[i];
                        modelInData = true;
                        break;
                    }
                }

                if (!modelInData) {
                    scope.model = null;
                }
            }
            if (!scope.model && !scope.chooseText && scope.data.length) {
                scope.model = scope.data[0];
            }
        };

        return {
            restrict: 'E',
            replace: true,
            scope: {
                model: '=',
                data: '=',
                propertyName: '@',
                required: '=?',
                chooseText: '=?',
                displayValueExp: '&'
            },
            templateUrl: 'sofa-select-box.tpl.html',
            link: function (scope) {

                // Initial run to map any preselected model values
                if (scope.data) {
                    mapModelToData(scope);
                }

                // If by any reason the data object has changed, we have to map any existing model data to the new data
                scope.$watchCollection('data', function (newData, oldData) {
                    if (newData !== oldData) {
                        mapModelToData(scope);
                    }
                });

                var displayValueFormatter = scope.displayValueExp();

                //default display function that will be used if no displayValueExp is given
                scope.displayFn = function (value) {
                    return value;
                };

                if (angular.isFunction(displayValueFormatter)) {
                    scope.displayFn = displayValueFormatter;
                } else if (angular.isString(displayValueFormatter)) {

                    var properties = displayValueFormatter.split('.');

                    scope.displayFn = function (value) {

                        if (!value) {
                            return value;
                        }
                        var tempValue = value;
                        properties.forEach(function (node) {
                            tempValue = tempValue[node];
                        });
                        return tempValue;
                    };
                }
            }
        };
    });
}(angular));
