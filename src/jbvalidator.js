(function ($) {
    "use strict"

    $.fn.jbvalidator = function (options) {

        let defaults = {
            language: '', //json file url
            errorMessage: true,
            successClass: false,
            html5BrowserDefault: false,
            validFeedBackClass: 'valid-feedback',
            invalidFeedBackClass: 'invalid-feedback',
            validClass: 'is-valid',
            invalidClass: 'is-invalid'
        }

        options = $.extend({}, defaults, options);

        let FORM = this;

        let errorMessages = {
            maxValue: "Value must be less than or equal to %s.",
            minValue: "Value must be greater than or equal to %s.",
            maxLength: "Please lengthen this text to %s characters or less (you are currently using %s characters).",
            minLength: "Please lengthen this text to %s characters or more (you are currently using %s characters).",
            minSelectOption: "Please select at least %s options.",
            maxSelectOption: "Please select at most %s options.",
            groupCheckBox: "Please select at least %s options.",
            equal: "This field does not match with %s field.",
            fileMinSize: "File size cannot be less than %s bytes.",
            fileMaxSize: "File size cannot be more than %s bytes.",
            number: "Please enter a number.",
            HTML5: {
                valueMissing: {
                    INPUT: {
                        default: "Please fill out this field.",
                        checkbox: "Please check this box.",
                        radio: "Please select one of these options.",
                        file: "Please select a file."
                    },
                    SELECT: "Please select an item in the list.",
                    TEXTAREA: "Please fill out this field."
                },
                typeMismatch: {
                    email: "Please enter an e-mail address.",
                    url: "Please enter a URL."
                },
                rangeUnderflow: {
                    date: "Value must be %s or later.",
                    month: "Value must be %s or later.",
                    week: "Value must be %s or later.",
                    time: "Value must be %s or later.",
                    datetimeLocale: "Value must be %s or later.",
                    number: "Value must be greater than or equal to %s.",
                    range: "Value must be greater than or equal to %s."
                },
                rangeOverflow: {
                    date: "Value must be %s or earlier.",
                    month: "Value must be %s or earlier.",
                    week: "Value must be %s or earlier.",
                    time: "Value must be %s or earlier.",
                    datetimeLocale: "Value must be %s or earlier.",
                    number: "Value must be less than or equal to %s.",
                    range: "Value must be less than or equal to %s."
                },
                stepMismatch: {
                    date: "You can only select every %s. day in the date calendar.",
                    month: "You can only select every %s. month in the date calendar.",
                    week: "You can only select every %s. week in the date calendar.",
                    time: "You can only select every %s. second in the time picker.",
                    datetimeLocale: "You can only select every %s. second in the time picker.",
                    number: "Please enter a valid value. Only %s and a multiple of %s.",
                    range: "Please enter a valid value. Only %s and a multiple of %s."
                },
                tooLong: "Please lengthen this text to %s characters or less (you are currently using %s characters).",
                tooShort: "Please lengthen this text to %s characters or more (you are currently using %s characters).",
                patternMismatch: "Please match the request format. %s",
                badInput: {
                    number: "Please enter a number."
                }
            }
        };

        const selector = 'input, textarea, select';

        let STATUS = 0;

        /**
         * change language from json file
         */
        if (options.language) {

            $.getJSON(options.language, function (json) {

                errorMessages = json;
            })
        }


        /**
         * run validate when form submit
         */
        $(FORM).on('submit', function (event) {

            STATUS = 0;

            checkAll(this, event);

            if (STATUS) {
                event.preventDefault();
                event.stopPropagation();
            }
        });


        let checkAll = function (form, event) {
            let thisForm = form ? form : FORM;
            let thisEvent = event ? event : '';
            STATUS = 0;
            $(thisForm).find(selector).each((i, el) => {
                validationRun(el, thisEvent);
            });

            return STATUS;
        }

        /**
         * run validate when on input
         */
        let run = function () {
            $(FORM).find(selector).each((i, el) => {

                $(el).off('input');
                $(el).on('input', function (event) {

                    validationRun(this, event);

                    if (hasAttr(el, 'data-v-equal')) {
                        let equal = $(el).attr('data-v-equal');
                        $(equal).one('input', function () {
                            let id = $(this).attr('id');
                            $('[data-v-equal="#' + id + '"]').trigger('input');
                        });
                    }
                })
            })
        }

        let validationRun = function (el, event) {

            el.setCustomValidity('');

            if (el.checkValidity() !== false) {

                Object.values(validator).map((value) => {

                    let error = value.call(value, el, event);

                    if (error) {
                        el.setCustomValidity(error);
                    }
                });
            } else {
                if (!options.html5BrowserDefault) {
                    el.setCustomValidity(HTML5Default(el))
                }
            }

            if (el.checkValidity() === false) {
                showErrorMessage(el, el.validationMessage);
                STATUS++;
            } else {
                hideErrorMessage(el);
            }
        }

        /**
         * show errors
         * @param el
         * @param message
         */
        let showErrorMessage = function (el, message) {

            $(el).removeClass(options.validClass);
            $(el).addClass(options.invalidClass);

            message = $(el).data('vMessage') ?? message;

            if (options.errorMessage) {
                let group = $(el).parent();

                if ($(group).length) {
                    let invalidFeedBack = $(group).find('.' + options.invalidFeedBackClass);
                    if ($(invalidFeedBack).length) {
                        $(invalidFeedBack).html(message);
                    } else {
                        $(group).append('<div class="' + options.invalidFeedBackClass + '">' + message + '</div>');
                    }
                }
            }
        }

        let hideErrorMessage = function (el) {

            $(el).removeClass(options.invalidClass);

            if (options.successClass) {
                $(el).addClass(options.validClass);
            }
        }

        let validator = {

            multiSelectMin: function (el) {

                if ($(el).prop("tagName") === "SELECT" && $(el).prop('multiple')) {

                    let mustSelectedCount = $(el).data('vMinSelect');
                    let selectedCount = $(el).find('option:selected').length;

                    if (selectedCount < mustSelectedCount && ($(el).prop('require') || selectedCount > 0)) {
                        return errorMessages.minSelectOption.sprintf(mustSelectedCount);
                    }
                }
                return '';
            },

            multiSelectMax: function (el) {

                if ($(el).prop("tagName") === "SELECT" && $(el).prop('multiple')) {

                    let mustSelectedCount = $(el).data('vMaxSelect');
                    let selectedCount = $(el).find('option:selected').length;

                    if (selectedCount > mustSelectedCount && ($(el).prop('require') || selectedCount > 0)) {
                        return errorMessages.maxSelectOption.sprintf(mustSelectedCount);
                    }
                }
                return '';
            },

            equal: function (el) {

                let equal = $(el).data('vEqual');

                if (equal) {
                    let title = $(equal).attr('title');

                    if ($(equal).val() !== $(el).val()) {
                        return errorMessages.equal.sprintf(title ? title : '');
                    }
                }
                return '';
            },

            groupCheckBox: function (el, event) {

                if (hasAttr(el, 'type', 'checkbox')) {

                    let checkGroup = $(el).closest('[data-checkbox-group]');
                    let mustCheckedCount = $(checkGroup).data('vMinSelect');
                    let checkedCount = checkGroup.find('input[type=checkbox]:checked').length;
                    let groupRequired = typeof $(checkGroup).data('vRequired') === "undefined" ? 0 : 1;

                    if (checkGroup) {

                        if (typeof event.originalEvent !== "undefined" && event.originalEvent.type === 'input') {
                            $(checkGroup).find('input[type=checkbox]').each((i, item) => {
                                $(item).trigger('input');
                            })
                        }

                        if (checkedCount < mustCheckedCount && (groupRequired || checkedCount > 0)) {
                            if ($(el).prop('checked') === false) {
                                return errorMessages.groupCheckBox.sprintf(mustCheckedCount);
                            }
                        }
                    }
                }
                return '';
            },

            customMin: function (el) {

                if (hasAttr(el, 'data-v-min')) {

                    let mustMin = $(el).data('vMin');
                    let value = $(el).val();

                    if (isNaN(value) && ($(el).prop('require') || value.length > 0)) {

                        return errorMessages.number;
                    }

                    if (value < mustMin && ($(el).prop('require') || value.length > 0)) {

                        return errorMessages.minValue.sprintf(mustMin);
                    }
                }
                return '';
            },

            customMax: function (el) {

                if (hasAttr(el, 'data-v-max')) {

                    let mustMax = $(el).data('vMax');
                    let value = $(el).val();

                    if (isNaN(value) && ($(el).prop('require') || value.length > 0)) {

                        return errorMessages.number;
                    }

                    if (value > mustMax && ($(el).prop('require') || value.length > 0)) {

                        return errorMessages.maxValue.sprintf(mustMax);
                    }
                }
                return '';
            },

            customMinLength: function (el) {

                if (hasAttr(el, 'data-v-min-length')) {

                    let mustMin = $(el).data('vMinLength');
                    let value = $(el).val().length;

                    if (value < mustMin && ($(el).prop('require') || value > 0)) {
                        return errorMessages.minLength.sprintf(mustMin, value);
                    }
                }
                return '';
            },

            customMaxLength: function (el) {

                if (hasAttr(el, 'data-v-max-length')) {

                    let mustMax = $(el).data('vMaxLength');
                    let value = $(el).val().length;

                    if (value > mustMax && ($(el).prop('require') || value > 0)) {
                        return errorMessages.maxLength.sprintf(mustMax, value);
                    }
                }
                return '';
            },

            fileMinSize: function (el) {

                if (hasAttr(el, 'type', 'file')) {

                    let size = $(el).data('vMinSize');

                    for (let i = 0; i < el.files.length; i++) {

                        if (size && size > el.files[i].size) {
                            return errorMessages.fileMinSize.sprintf(size);
                        }
                    }
                }
                return '';
            },

            fileMaxSize: function (el) {

                if (hasAttr(el, 'type', 'file')) {

                    let size = $(el).data('vMaxSize');

                    for (let i = 0; i < el.files.length; i++) {

                        if (size && size < el.files[i].size) {
                            return errorMessages.fileMaxSize.sprintf(size);
                        }
                    }
                }
                return '';
            }
        };

        /**
         * HTML 5 default error to selected language
         * @param el
         * @returns {null|jQuery|HTMLElement|undefined|string|*}
         * @constructor
         */
        let HTML5Default = function (el) {

            if (el.validity.valueMissing) {
                if (el.tagName === 'INPUT') {

                    if (typeof errorMessages.HTML5.valueMissing.INPUT[el.type] === 'undefined') {
                        return errorMessages.HTML5.valueMissing.INPUT.default;
                    } else {
                        return errorMessages.HTML5.valueMissing.INPUT[el.type];
                    }

                } else {

                    if (typeof errorMessages.HTML5.valueMissing[el.tagName] !== 'undefined') {
                        return errorMessages.HTML5.valueMissing[el.tagName];
                    }
                }
            } else if (el.validity.typeMismatch) {

                if (typeof errorMessages.HTML5.typeMismatch[el.type] !== 'undefined') {
                    return errorMessages.HTML5.typeMismatch[el.type];
                }

            } else if (el.validity.rangeOverflow) {

                if (typeof errorMessages.HTML5.rangeOverflow[el.type] !== 'undefined') {
                    let max = el.getAttribute('max') ?? null;

                    if (el.type === 'date' || el.type === 'month') {
                        let date = new Date(max);
                        max = date.toLocaleDateString();
                    }
                    if (el.type === 'week') {
                        max = "Week " + max.substr(6);
                    }

                    return errorMessages.HTML5.rangeOverflow[el.type].sprintf(max);
                }

            } else if (el.validity.rangeUnderflow) {

                if (typeof errorMessages.HTML5.rangeUnderflow[el.type] !== 'undefined') {
                    let min = el.getAttribute('min') ?? null;

                    if (el.type === 'date' || el.type === 'month') {
                        let date = new Date(min);
                        min = date.toLocaleDateString();
                    }
                    if (el.type === 'week') {
                        min = "Week " + min.substr(6);
                    }

                    return errorMessages.HTML5.rangeUnderflow[el.type].sprintf(min);
                }

            } else if (el.validity.stepMismatch) {

                if (typeof errorMessages.HTML5.stepMismatch[el.type] !== 'undefined') {
                    let step = el.getAttribute('step') ?? null;

                    if (el.type === 'date' || el.type === 'month') {
                        let date = new Date(step);
                        step = date.toLocaleDateString();
                    }
                    if (el.type === 'week') {
                        step = "Week " + step.substr(6);
                    }

                    return errorMessages.HTML5.stepMismatch[el.type].sprintf(step, step);
                }

            } else if (el.validity.tooLong) {

                let minLength = el.getAttribute('maxlength') ?? null;
                let value = $(el).val();
                return errorMessages.HTML5.tooLong.sprintf(minLength, value.length);

            } else if (el.validity.tooShort) {

                let maxLength = el.getAttribute('minlength') ?? null;
                let value = $(el).val();
                return errorMessages.HTML5.tooShort.sprintf(maxLength, value.length);

            } else if (el.validity.patternMismatch) {

                if (hasAttr(el, 'pattern') && hasAttr(el, 'title')) {
                    return $(el).attr('title');
                }
                let pattern = el.getAttribute('pattern') ?? null;
                return errorMessages.HTML5.patternMismatch.sprintf(pattern);

            } else if (el.validity.badInput) {

                if (typeof errorMessages.HTML5.badInput[el.type] !== 'undefined') {
                    return errorMessages.HTML5.badInput[el.type];
                }

            }

            return el.validationMessage ?? '';
        }

        /**
         * triger error
         * @param el
         * @param message
         */

        let errorTrigger = function (el, message) {

            if (typeof el === 'object') {
                el = el[0];
            }

            el.setCustomValidity(message);
            showErrorMessage(el, el.validationMessage);
        }

        let reload = function () {
            run();
        }

        /**
         * attr equal with value or has attr
         * @param el
         * @param attr
         * @param value
         * @returns {boolean}
         */
        function hasAttr(el, attr, value = '') {

            let val = $(el).attr(attr);

            if (typeof val !== typeof undefined && val !== false) {
                if (value) {
                    if (value === val) {
                        return true;
                    }
                } else {
                    return true;
                }
            }

            return false;
        }

        /**
         * php sprintf alternate
         * @returns {string}
         */
        String.prototype.sprintf = function () {
            var output = this.toString();
            for (var i = 0; i < arguments.length; i++) {
                var asNum = parseFloat(arguments[i])
                if (asNum || asNum == 0) {
                    var suffix = (asNum > 1 || asNum == 0) ? "s" : ""
                    output = output.replace(/%s {1}(\w+)\(s\){1}/, "%s $1" + suffix)
                }
                output = output.replace("%s", arguments[i])
            }
            return output;
        }

        run();

        return {
            validator,
            errorTrigger,
            reload,
            checkAll
        }
    }
})(jQuery);
