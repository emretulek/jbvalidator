(function ($) {
    "use strict"

    $.fn.jbvalidator = function (options) {

        let defaults = {
            language: '', //json file url
            errorMessage: true,
            successClass: false,
            validFeedBackClass: 'valid-feedbak',
            invalidFeedBackClass: 'invalid-feedback',
            validClass: 'is-valid',
            invalidClass: 'is-invalid'
        }

        options = $.extend({}, defaults, options);

        let FORM = this;

        let errorMessages = {
            maxValue: "The number you enter cannot be greater than %s.",
            minValue: "The number you entered can be at least %s.",
            maxLength: "You can use up to %s characters. You are using %s characters.",
            minLength: "You must use at least %s characters, you are using %s characters.",
            minSelectOption: "Please select at least %s options.",
            maxSelectOption: "Please select at most %s options.",
            groupCheckBox: "Please select at least %s options.",
            equal: "Does not match the %s field.",
            fileMinSize: "File size cannot be less than %s bytes.",
            fileMaxSize: "File size cannot be more than %s bytes.",
            number: "Please write a number."
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

            $(this).find(selector).each((i, el) => {

                validationRun(el, event);
            });

            if (STATUS) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        /**
         * run validate when on input
         */
        $(FORM).find(selector).each((i, el) => {

            $(el).on('input', function (event) {

                validationRun(this, event);

                if (hasAttr(el, 'data-v-equal')) {
                    let equal = $(el).attr('data-v-equal');
                    $(equal).on('input', function (){
                        let id = $(this).attr('id');
                        $('[data-v-equal="#' + id + '"]').trigger('input');
                    });
                }
            })
        })


        let validationRun = function (el, event) {

            el.setCustomValidity('');

            let error = '';

            if (el.checkValidity() !== false) {

                Object.values(validator).map((value) => {
                    error = value.call(value, el, event);
                    if(error && value.name !== 'patternCustomMessage'){
                        el.setCustomValidity(error);
                    }
                });
            } else {
                if (el.validity.patternMismatch) {
                    error = validator.patternCustomMessage(el);
                    el.setCustomValidity(error)
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
                    let invalidFeedBack = $(group).find('.'+ options.invalidFeedBackClass);
                    if ($(invalidFeedBack).length) {
                        $(invalidFeedBack).html(message);
                    } else {
                        $(group).append('<div class="'+options.invalidFeedBackClass+'">' + message + '</div>');
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

            patternCustomMessage : function (el) {

                if (hasAttr(el, 'pattern') && hasAttr(el, 'title')) {
                    return $(el).attr('title');
                }
                return el.validationMessage;
            },

            multiSelectMin : function (el) {

                if ($(el).prop("tagName") === "SELECT" && $(el).prop('multiple')) {

                    let mustSelectedCount = $(el).data('vMinSelect');
                    let selectedCount = $(el).find('option:selected').length;

                    if (selectedCount < mustSelectedCount && ($(el).prop('require') || selectedCount > 0)) {
                        return errorMessages.minSelectOption.sprintf(mustSelectedCount);
                    }
                }
                return '';
            },

            multiSelectMax : function (el) {

                if ($(el).prop("tagName") === "SELECT" && $(el).prop('multiple')) {

                    let mustSelectedCount = $(el).data('vMaxSelect');
                    let selectedCount = $(el).find('option:selected').length;

                    if (selectedCount > mustSelectedCount && ($(el).prop('require') || selectedCount > 0)) {
                        return errorMessages.maxSelectOption.sprintf(mustSelectedCount);
                    }
                }
                return '';
            },

            equal : function (el) {

                let equal = $(el).data('vEqual');

                if (equal) {
                    let title = $(equal).attr('title');

                    if ($(equal).val() !== $(el).val()) {
                        return errorMessages.equal.sprintf(title ? title : '');
                    }
                }
                return '';
            },

            groupCheckBox : function (el, event) {

                if (hasAttr(el, 'type', 'checkbox')) {

                    let checkGroup = $(el).closest('[data-checkbox-group]');
                    let mustCheckedCount = $(checkGroup).data('vMinSelect');
                    let checkedCount = checkGroup.find('input[type=checkbox]:checked').length;
                    let groupRequired = typeof $(checkGroup).data('vRequired') === "undefined" ? 0 : 1;

                    if (checkGroup) {

                        if(typeof event.originalEvent !== "undefined" && event.originalEvent.type === 'input') {
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

            customMin : function (el) {

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

            customMax : function (el) {

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

            customMinLength : function (el) {

                if (hasAttr(el, 'data-v-min-length')) {

                    let mustMin = $(el).data('vMinLength');
                    let value = $(el).val().length;

                    if (value < mustMin && ($(el).prop('require') || value > 0)) {
                        return errorMessages.minLength.sprintf(mustMin, value);
                    }
                }
                return '';
            },

            customMaxLength : function (el) {

                if (hasAttr(el, 'data-v-max-length')) {

                    let mustMax = $(el).data('vMaxLength');
                    let value = $(el).val().length;

                    if (value > mustMax && ($(el).prop('require') || value > 0)) {
                        return errorMessages.maxLength.sprintf(mustMax, value);
                    }
                }
                return '';
            },

            fileMinSize : function (el) {

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

            fileMaxSize : function (el) {

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


        let errorTrigger = function (el, message) {

            if (typeof el === 'object') {
                el = el[0];
            }

            el.setCustomValidity(message);
            showErrorMessage(el, el.validationMessage);
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

        return {
            validator,
            errorTrigger
        }
    }
})(jQuery);
