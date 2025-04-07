/**
 * non-used code, just keep it there for future reference.
 */

// customized validator example
export function objectChainValidator(objectOfValidator: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const requiredResult = Validators.required(value);
    console.info(`in customed validator`);
    if(requiredResult) {
      return requiredResult;
      // return 'Cannot not be empty!';  
      // return forbidden ? {'': {value: control.value}} : null;
    }
    for(let key in objectOfValidator) {
      const valueToBeValidate = value[key];
      const validator = objectOfValidator[key];
      const validateResult = validator(valueToBeValidate);
      if(validateResult) {
        console.info(`key: ${key}, value: ${valueToBeValidate} validate failed!`);
        return validateResult
      }
    }
    return null;
  };
}

