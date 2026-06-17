import { validate } from "./validator.js";

export const Form = {
  validate(form, data, validationRules) {
    this.clearErrors(form);

    const result = validate(
      data,
      validationRules
    );

    Object.entries(result.errors).forEach(
      ([field]) => {
        const input =
          form.querySelector(
            `[(name = "${field}")]`
          );

        input?.classList.add(
          "border-red-500"
        );
      }
    );

    return result;
  },

  clearErrors(form) {
    form.querySelectorAll(".border-red-500").forEach((el) => {
      el.classList.remove("border-red-500");
    });
  },
};
