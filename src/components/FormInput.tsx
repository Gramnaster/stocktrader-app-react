interface FormInputType {
  label: string,
  name: string,
  type: string,
  placeholder: string,
}

const FormInput = ({label, name, type, placeholder}:FormInputType) => {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <input type={type} name={name} className="input h-6 max-w-[375px] w-full" placeholder={placeholder} />
      {/* <p className="label">Optional</p> */}
    </fieldset>
  );
};
export default FormInput;
