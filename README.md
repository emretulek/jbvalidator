HTML 5 & Bootstrap Jquery Form Validation Plugin
================================================

### HTML 5 & Bootstrap 5 & Jquery 3

jbvalidator is a fresh new jQuery based form validation plugin that is created for the latest Bootstrap 5 framework and supports both client side and server-side validation.

- Multiple languages.
- Custom error messages.
- Custom validation rules.
- Easy to use via HTML data attribute.

### Installation

```
npm i @emretulek/jbvalidator
```
Or grab from jsdelivr CDN :
```html
<script src="https://cdn.jsdelivr.net/npm/@emretulek/jbvalidator"></script>
```

##### [DEMO LINK](https://emretulek.github.io/jbvalidator/)

-   **Html 5 validation**
-   **data-v-equal**: id of the element that should be the same
-   **data-v-min-select**: multiple selectbox, minimum selectable count
-   **data-v-max-select**: multiple selectbox, maximum selectable count
-   **data-checkbox-group**: the parent attribute of group checkbox elements
-   **data-v-min**: alternative of the min attribute, this can be used for attribute type text
-   **data-v-max**: alternative of the max attribute, this can be used for attribute type text
-   **data-v-min-length**: alternative of the minlength attribute
-   **data-v-max-length**: alternative of the maxlength attribute
-   **data-v-min-size**: the input type file minimum file size (byte)
-   **data-v-max-size**: the input type file maximum file size (byte)
-   **data-v-message**: alternative error mesage

### Methods

-   **validator**: add new custom validation
-   **checkAll(formSelector = null, event = null)**: show errors without submitting the form, return error count
-   **errorTrigger(inputSelector, message)**: show the error messages returned from the server.
-   **reload()**: reload instance after dynamic element is added

### Usage

The form's attribute have to novalidate `<form novalidate>`
```javascript
<script src="dist/jbvalidator.min.js"></script>
<script>
    $(function (){

        let validator = $('form.needs-validation').jbvalidator({
            errorMessage: true,
            successClass: true,
            language: "https://emretulek.github.io/jbvalidator/dist/lang/en.json"
        });

        //custom validate methode
        validator.validator.custom = function(el, event){
            if($(el).is('[name=password]') && $(el).val().length < 5){
                return 'Your password is too weak.';
            }
        }

        validator.validator.example = function(el, event){
            if($(el).is('[name=username]') && $(el).val().length < 3){
                return 'Your username is too short.';
            }
        }

        //check form without submit
        validator.checkAll(); //return error count

        //reload instance after dynamic element is added
        validator.reload();
    })
</script>
```

### Serverside validation

You can show the error messages returned from the server. The ".errorTrigger" method can be used for this.

.errorTrigger(element, message)

```javascript
<script src="dist/jbvalidator.min.js"></script>
<script>
    $(function (){

       let validatorServerSide = $('form.validatorServerSide').jbvalidator({
            errorMessage: true,
            successClass: false,
        });

        //serverside
        $(document).on('submit', '.validatorServerSide', function(){

            $.ajax({
                method:"get",
                url:"http://jsvalidation.test/test.json",
                data: $(this).serialize(),
                success: function (data){
                    if(data.status === 'error') {
                        validatorServerSide.errorTrigger($('[name=username]'), data.message);
                    }
                }
            })

            return false;
        });
    })
</script>
```

### Options

```
{
    language: '', //json file url
    errorMessage: true,
    successClass: false,
    html5BrowserDefault: false,
    validFeedBackClass: 'valid-feedback',
    invalidFeedBackClass: 'invalid-feedback',
    validClass: 'is-valid',
    invalidClass: 'is-invalid'
}
```

### Language file content
```
{
  "maxValue": "Value must be less than or equal to %s.",
  "minValue": "Value must be greater than or equal to %s.",
  "maxLength": "Please lengthen this text to %s characters or less (you are currently using %s characters).",
  "minLength": "Please lengthen this text to %s characters or more (you are currently using %s characters).",
  "minSelectOption": "Please select at least %s options.",
  "maxSelectOption": "Please select at most %s options.",
  "groupCheckBox": "Please select at least %s options.",
  "equal": "This field does not match with %s field.",
  "fileMinSize": "File size cannot be less than %s bytes.",
  "fileMaxSize": "File size cannot be more than %s bytes.",
  "number": "Please enter a number.",
  "HTML5": {
    "valueMissing": {
      "INPUT": {
        "default": "Please fill out this field.",
        "checkbox": "Please check this box.",
        "radio": "Please select one of these options.",
        "file": "Please select a file."
      },
      "SELECT": "Please select an item in the list."
    },
    "typeMismatch": {
      "email": "Please enter an e-mail address.",
      "url": "Please enter a URL."
    },
    "rangeUnderflow": {
      "date": "Value must be %s or later.",
      "month": "Value must be %s or later.",
      "week": "Value must be %s or later.",
      "time": "Value must be %s or later.",
      "datetimeLocale": "Value must be %s or later.",
      "number": "Value must be greater than or equal to %s.",
      "range": "Value must be greater than or equal to %s."
    },
    "rangeOverflow": {
      "date": "Value must be %s or earlier.",
      "month": "Value must be %s or earlier.",
      "week": "Value must be %s or earlier.",
      "time": "Value must be %s or earlier.",
      "datetimeLocale": "Value must be %s or earlier.",
      "number": "Value must be less than or equal to %s.",
      "range": "Value must be less than or equal to %s."
    },
    "stepMismatch": {
      "date": "You can only select every %s. day in the date calendar.",
      "month": "You can only select every %s. month in the date calendar.",
      "week": "You can only select every %s. week in the date calendar.",
      "time": "You can only select every %s. second in the time picker.",
      "datetimeLocale": "You can only select every %s. second in the time picker.",
      "number": "Please enter a valid value. Only %s and a multiple of %s.",
      "range": "Please enter a valid value. Only %s and a multiple of %s."
    },
    "tooLong": "Please lengthen this text to %s characters or less (you are currently using %s characters).",
    "tooShort": "Please lengthen this text to %s characters or more (you are currently using %s characters).",
    "patternMismatch": "Please match the request format. %s",
    "badInput": {
      "number": "Please enter a number."
    }
  }
}
```
