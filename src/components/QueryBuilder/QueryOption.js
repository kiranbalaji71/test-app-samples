// 💡 Idea!
// ⏳ Set a timer ⏪ & allow undo ⛔ while closing the group query 🗂️


export const operatorsOption = [
  { value: "contains", label: "Contains" },
  { value: "not-contains", label: "Not contains" },
];

export const operatorsOptionForAge = [
  { value: "equal", label: "equal" },
  { value: "not-equal", label: "not equal" },
  { value: "between", label: "between" },
  { value: "not-between", label: "not between" },
  { value: "greater-than", label: "greater than" },
  { value: "less-than", label: "less than" },
  { value: "greater-than-equal", label: "greater than or equal" },
  { value: "less-than-equal", label: "less than or equal" },
];

export const combinatorOption = [
  { label: "AND", value: "and" },
  { label: "OR", value: "or" },
];

export const RulesInputType = {
  text: "string",
  date: "date",
  number: "decimal",
  select: "list",
  age: "age",
  multiple: "multiple",
};

export const RuleDataOption = [
  {
    title: "Appointment",
    input_type: "list",
    values: [
      {
        selected_value: "Appointment Date",
        input_type: "string",
      },
      {
        selected_value: "Appointment ID",
        input_type: "decimal",
      },
      {
        selected_value: "Date & Time",
        input_type: "string",
      },
      {
        selected_value: "Doctor Name",
        input_type: "string",
      },
      {
        selected_value: "Call Type",
        input_type: "string",
      },
    ],
  },
  {
    title: "Communication",
    input_type: "list",
    values: [
      {
        selected_value: "Whatsapp",
        input_type: "list",
      },
      {
        selected_value: "SMS",
        input_type: "list",
      },
      {
        selected_value: "Email",
        input_type: "list",
      },
    ],
  },
  {
    title: "Status",
    input_type: "string",
  },
  {
    title: "Profile holder age",
    input_type: "age",
  },
];

export const SubListOption = {
  Communication: {
    Whatsapp: [
      {
        selected_value: "Date & Time",
        input_type: "string",
      },
      {
        selected_value: "Content",
        input_type: "string",
      },
      {
        selected_value: "Status",
        input_type: "string",
      },
    ],
    SMS: [
      {
        selected_value: "Date & Time",
        input_type: "string",
      },
      {
        selected_value: "Content",
        input_type: "string",
      },
      {
        selected_value: "Status",
        input_type: "string",
      },
    ],
    Email: [
      {
        selected_value: "Date & Time",
        input_type: "string",
      },
      {
        selected_value: "Content",
        input_type: "string",
      },
      {
        selected_value: "Status",
        input_type: "string",
      },
    ],
  },
};
