# HTML 5 & Bootstrap Jquery Form Validation Plugin

### HTML 5 & Bootstrap 5 & Jquery 3

* **Html 5 validation**
* **data-v-equal**: id of the element that should be the same
* **data-v-min-select**: multiple selectbox, minimum selectable count
* **data-v-max-select**: multiple selectbox, maximum selectable count
* **data-checkbox-group**: the parent attribute of group checkbox elements
**data-v-min-select**: parent attribute minimum selectable count
**data-v-required**: parent attribute required
* **data-v-min**: alternative of the min attribute, this can be used for attribute type text
* **data-v-max**: alternative of the max attribute, this can be used for attribute type text
* **data-v-min-length**: alternative of the minlength attribute
* **data-v-max-length**: alternative of the maxlength attribute
* **data-v-min-size**: the input type file minimum file size (byte)
* **data-v-max-size**: the input type file maximum file size (byte)
* **data-v-message**: alternative error mesage

### Usage

```
        
        <script src="dist/jbvalidator.min.js"></script>
        <script>
            $(function (){

                let validator = $('form.needs-validation').jbvalidator({
                    errorMessage: true,
                    successClass: true,
                    language: "https://raw.githubusercontent.com/emretulek/jbvalidator/main/dist/lang/en.json"
                });

                //custom validate methode
                validator.validator.custom = function(el, event){
                    if($(el).is('[name=password]') && $(el).val().length < 5){
                        return 'Your password is too weak.';
                    }
                }
            })
        </script>
        
```

### Options

```
    {
        language: '', //json file url
        errorMessage: true,
        successClass: false,
        validFeedBackClass: 'valid-feedbak',
        invalidFeedBackClass: 'invalid-feedback',
        validClass: 'is-valid',
        invalidClass: 'is-invalid'
    }
```

### Language file content

```
    {
      "maxValue": "The number you enter cannot be greater than %s.",
      "minValue": "The number you entered can be at least %s.",
      "maxLength": "You can use up to %s characters. You are using %s characters.",
      "minLength": "You must use at least %s characters, you are using %s characters.",
      "minSelectOption": "Please select at least %s options.",
      "maxSelectOption": "Please select at most %s options.",
      "groupCheckBox": "Please select at least %s options.",
      "equal": "Does not match the %s field.",
      "fileMinSize": "File size cannot be less than %s bytes.",
      "fileMaxSize": "File size cannot be more than %s bytes.",
      "number": "Please write a number."
    }
```

### Serverside validation

.errorTrigger(element, message)
```
        
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
