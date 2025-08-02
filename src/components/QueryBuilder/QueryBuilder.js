import React, { useEffect, useState } from 'react';
import { CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import {
  RuleDataOption,
  RulesInputType,
  SubListOption,
  combinatorOption,
  operatorsOption,
  operatorsOptionForAge,
} from './QueryOption';
import { useForm } from 'antd/es/form/Form';
import './Query.scss';

const QueryBuilder = (props) => {
  const [form] = useForm();
  const [query, setQuery] = useState({});
  const [formData, setFormData] = useState();

  const handleSubmit = (value) => {
    const transformCondition = ({
      query_attribute,
      query_value,
      query_sub_value,
      query_final_value,
      query_contain,
      min_age,
      max_age,
    }) => {
      const title = query_final_value
        ? `${query_attribute}.${query_value}.${query_sub_value}`
        : query_sub_value
          ? `${query_attribute}.${query_value}`
          : query_attribute;

      const item = query_final_value || query_sub_value || query_value;

      return {
        title,
        action: query_contain,
        item: item ? (Array.isArray(item) ? item : [item]) : [],
        min_age: min_age || '',
        max_age: max_age || '',
        is_group: false,
      };
    };

    const transformGroup = (query) => ({
      query_type: query.query_type,
      is_group: true,
      condition: [
        ...(query.condition?.map(transformCondition) || []),
        ...(query.nested_condition?.flatMap(transformGroup) || []),
      ],
    });

    const transformQuery = (query) => ({
      query_id: 1,
      query_type: query.query_type,
      condition: [
        ...(query.condition?.map(transformCondition) || []),
        ...(query.nested_condition?.flatMap(transformGroup) || []),
      ],
    });

    setQuery(transformQuery(value));
  };

  const addItem = (path, newItem) => {
    const fields = form.getFieldValue(path) || [];
    const newFields = [...fields, newItem];
    form.setFieldsValue({ [path]: newFields });
  };

  const handleAddCondition = (path) => {
    addItem(path, {
      query_attribute: undefined,
      query_contain: undefined,
      query_value: undefined,
    });
  };

  const handleAddGroup = (path) => {
    addItem(path, {
      query_type: undefined,
      condition: [
        {
          query_attribute: undefined,
          query_contain: undefined,
          query_value: undefined,
        },
      ],
    });
  };

  const handleAddSubCondition = (index) => {
    const nestedConditions = form.getFieldValue(['nested_condition']) || [];
    const conditions = nestedConditions[index]?.condition || [];
    const newConditions = [
      ...conditions,
      {
        query_attribute: undefined,
        query_contain: undefined,
        query_value: undefined,
      },
    ];

    const updatedNestedConditions = [...nestedConditions];
    updatedNestedConditions[index] = {
      ...nestedConditions[index],
      condition: newConditions,
    };

    form.setFieldsValue({
      nested_condition: updatedNestedConditions,
    });
  };

  const handleQueryType = (queryType) => {
    if (queryType === 'and') {
      // return "All the conditions / groups selected";
      return '';
    } else if (queryType === 'or') {
      // return "One of the conditions / groups selected";
      return '';
    }
    return null;
  };

  const renderInputByType = (
    queryContain,
    className,
    inputType,
    fieldName,
    placeholder,
    options = [],
    reset = [],
  ) => {
    const commonProps = {
      className,
      name: fieldName,
      rules: [{ required: true, message: 'missing value' }],
    };

    const getAgeInput = () => {
      const isBetween =
        queryContain === 'between' || queryContain === 'not-between';
      return isBetween ? (
        <Space align="top">
          {['min_age', 'max_age'].map((ageType) => (
            <Form.Item
              key={ageType}
              name={[fieldName[0], ageType]}
              className={className}
              rules={[
                {
                  required: true,
                  message: `Missing ${ageType.replace('_', ' ')}`,
                },
              ]}
            >
              <InputNumber
                placeholder={`${ageType === 'min_age' ? 'Min' : 'Max'} age`}
                min={1}
                max={150}
              />
            </Form.Item>
          ))}
        </Space>
      ) : (
        <Form.Item
          name={[fieldName[0], 'min_age']}
          className={className}
          rules={[{ required: true, message: 'missing age' }]}
        >
          <InputNumber placeholder="Enter age" min={1} max={150} />
        </Form.Item>
      );
    };

    const inputComponents = {
      [RulesInputType.text]: <Input placeholder={placeholder} size="default" />,
      [RulesInputType.number]: (
        <InputNumber placeholder={placeholder} size="default" />
      ),
      [RulesInputType.age]: getAgeInput(),
      [RulesInputType.date]: <DatePicker size="default" />,
      [RulesInputType.multiple]: (
        <Select
          placeholder={placeholder}
          mode="multiple"
          size="default"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input?.trim().toLowerCase())
          }
          style={{ width: 150 }}
        />
      ),
      [RulesInputType.select]: (
        <Select
          placeholder={placeholder}
          options={options}
          size="default"
          showSearch
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input?.trim().toLowerCase())
          }
          onChange={() => form.resetFields(reset)}
          style={{ width: 150 }}
        />
      ),
    };

    return inputType === RulesInputType.age ? (
      inputComponents[inputType]
    ) : inputComponents[inputType] ? (
      <Form.Item {...commonProps}>{inputComponents[inputType]}</Form.Item>
    ) : null;
  };

  const renderQuery = (field, index, formList, remove, classPresent, type) => {
    return (
      <div
        className={classPresent ? 'queryGroup' : 'queryCondition'}
        key={field.key}
      >
        <Space style={{ alignItems: 'baseline' }} key={field.key} align="top">
          {/* Attribute Selector */}
          <Form.Item
            name={[field.name, 'query_attribute']}
            className={classPresent ? 'queryFieldInitial' : 'queryFormField'}
            rules={[{ required: true, message: 'missing attribute' }]}
          >
            <Select
              placeholder="Select attribute"
              size="default"
              options={formData?.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input?.trim().toLowerCase())
              }
              onChange={() => {
                form.resetFields([
                  [...formList, `${index}`, 'query_contain'],
                  [...formList, `${index}`, 'query_value'],
                  [...formList, `${index}`, 'query_sub_value'],
                  [...formList, `${index}`, 'query_final_value'],
                  [...formList, `${index}`, 'min_age'],
                  [...formList, `${index}`, 'max_age'],
                ]);
              }}
              style={{ width: 150 }}
            />
          </Form.Item>

          {/* Contains Selector */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const queryAttribute = getFieldValue([
                ...formList,
                `${index}`,
                'query_attribute',
              ]);

              const inputType = formData?.find(
                (option) => option.value === queryAttribute,
              )?.inputType;
              return (
                <Form.Item
                  name={[field.name, 'query_contain']}
                  className={
                    classPresent ? 'queryFieldInitial' : 'queryFormField'
                  }
                  rules={[{ required: true, message: 'missing contains' }]}
                >
                  <Select
                    placeholder="Select contains"
                    options={
                      inputType === 'age'
                        ? operatorsOptionForAge
                        : operatorsOption
                    }
                    showSearch
                    filterOption={(input, option) =>
                      option.label
                        .toLowerCase()
                        .indexOf(input?.trim().toLowerCase()) >= 0
                    }
                    onChange={() => {
                      inputType === 'age' &&
                        form.resetFields([
                          [...formList, `${index}`, 'min_age'],
                          [...formList, `${index}`, 'max_age'],
                        ]);
                    }}
                    size="default"
                    style={{ width: 150 }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>

          {/* Value Selector and Sub-value Input */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const queryAttribute = getFieldValue([
                ...formList,
                `${index}`,
                'query_attribute',
              ]);
              const queryContain = getFieldValue([
                ...formList,
                `${index}`,
                'query_contain',
              ]);
              const inputType = formData?.find(
                (option) => option.value === queryAttribute,
              )?.inputType;
              const options = formData?.find(
                (option) => option.value === queryAttribute,
              )?.children;

              return renderInputByType(
                queryContain,
                classPresent ? 'queryFieldInitial' : 'queryFormField',
                inputType,
                [field.name, 'query_value'],
                'Enter value',
                options,
                [
                  [...formList, `${index}`, 'query_sub_value'],
                  [...formList, `${index}`, 'query_final_value'],
                ],
              );
            }}
          </Form.Item>

          {/* Sub-value Input */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const queryAttribute = getFieldValue([
                ...formList,
                `${index}`,
                'query_attribute',
              ]);
              const queryContain = getFieldValue([
                ...formList,
                `${index}`,
                'query_contain',
              ]);
              const queryValue = getFieldValue([
                ...formList,
                `${index}`,
                'query_value',
              ]);
              const selectedAttribute = formData?.find(
                (option) => option.value === queryAttribute,
              );
              const inputType = selectedAttribute?.children?.find(
                (child) => child.value === queryValue,
              )?.inputType;
              const subListOptions =
                SubListOption[queryAttribute]?.[queryValue] || [];
              const options = subListOptions?.map((item) => ({
                value: item.selected_value,
                label: item.selected_value,
              }));

              return renderInputByType(
                queryContain,
                classPresent ? 'queryFieldInitial' : 'queryFormField',
                inputType,
                [field.name, 'query_sub_value'],
                'Enter value',
                options,
                [[...formList, `${index}`, 'query_final_value']],
              );
            }}
          </Form.Item>

          {/* Final Value Input */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const queryAttribute = getFieldValue([
                ...formList,
                `${index}`,
                'query_attribute',
              ]);
              const queryContain = getFieldValue([
                ...formList,
                `${index}`,
                'query_contain',
              ]);
              const queryValue = getFieldValue([
                ...formList,
                `${index}`,
                'query_value',
              ]);
              const querySubValue = getFieldValue([
                ...formList,
                `${index}`,
                'query_sub_value',
              ]);
              const selectedSubOption = SubListOption[queryAttribute]?.[
                queryValue
              ]?.find((item) => item.selected_value === querySubValue);
              const finalInputType = selectedSubOption?.input_type;

              return renderInputByType(
                queryContain,
                classPresent ? 'queryFieldInitial' : 'queryFormField',
                finalInputType,
                [field.name, 'query_final_value'],
                'Enter value',
              );
            }}
          </Form.Item>

          {/* Remove Button */}
          <Button
            size="default"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(field.name)}
          />
        </Space>
      </div>
    );
  };

  const renderQueryGroup = (field, index, formList, remove, classPresent) => {
    return (
      <div
        className={classPresent ? 'queryGroup' : 'querySubGroup'}
        key={field.key}
      >
        <Row
          justify="space-between"
          key={field.key}
          style={{ marginBottom: 10 }}
        >
          <Col>
            <Space>
              <Form.Item
                name={[field.name, 'query_type']}
                noStyle
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select condition"
                  size="default"
                  options={combinatorOption}
                  style={{ width: 120 }}
                />
              </Form.Item>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => {
                  return (
                    <div className="queryTypeStatement">
                      {handleQueryType(
                        getFieldValue([...formList, `${index}`, 'query_type']),
                      )}
                    </div>
                  );
                }}
              </Form.Item>
            </Space>
          </Col>
          <Col>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => remove(field.name)}
            />
          </Col>
        </Row>
        <div className="queryNewCondition">
          <Form.List name={[field.name, 'condition']}>
            {(subFields, subOpt) => (
              <>
                {subFields?.map((subField, subIndex) =>
                  renderQuery(
                    subField,
                    subIndex,
                    [...formList, `${index}`, 'condition'],
                    subOpt.remove,
                    false,
                    [...formList, `${index}`, 'query_type'],
                  ),
                )}
                {!classPresent && (
                  <div className="queryTop">
                    <Space>
                      <Button
                        className="queryBtn"
                        type="dashed"
                        size="default"
                        onClick={() => subOpt.add()}
                        icon={<PlusOutlined style={{ color: '#12289b' }} />}
                      >
                        Add condition
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            )}
          </Form.List>
          <Form.List name={[field.name, 'nested_condition']}>
            {(nestedFields, nestedOpt) => (
              <>
                {nestedFields?.map((nestedField, nestedIndex) =>
                  renderQueryGroup(
                    nestedField,
                    nestedIndex,
                    [...formList, `${index}`, 'nested_condition'],
                    nestedOpt.remove,
                    false,
                  ),
                )}
                {classPresent && (
                  <div className="queryTop">
                    <Space>
                      <Button
                        className="queryBtn"
                        type="dashed"
                        size="default"
                        onClick={() => {
                          nestedOpt.add({
                            query_type: undefined,
                            condition: [
                              {
                                query_attribute: undefined,
                                query_contain: undefined,
                                query_value: undefined,
                              },
                            ],
                          });
                        }}
                        icon={<PlusOutlined style={{ color: '#12289b' }} />}
                      >
                        Add group
                      </Button>
                      <Button
                        className="queryBtn"
                        type="dashed"
                        size="default"
                        onClick={() => handleAddSubCondition(field.name)}
                        icon={<PlusOutlined style={{ color: '#12289b' }} />}
                      >
                        Add condition
                      </Button>
                    </Space>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </div>
      </div>
    );
  };

  const transformCondition = (condition) => {
    const titleParts = condition?.title?.split('.') || [];
    const titleDotsCount = titleParts.length - 1;

    return {
      query_attribute: titleParts[0] || undefined,
      query_contain: condition?.action || undefined,
      query_value:
        titleDotsCount === 0 ? condition?.item || undefined : titleParts[1],
      query_sub_value:
        titleDotsCount === 1 ? condition?.item || undefined : titleParts[2],
      query_final_value:
        titleDotsCount === 2 ? condition?.item || undefined : undefined,
      min_age: condition.min_age !== '' ? condition.min_age : undefined,
      max_age: condition.max_age !== '' ? condition.max_age : undefined,
    };
  };

  const destructureConditions = (conditions) =>
    conditions
      ?.filter((condition) => !condition?.is_group)
      ?.map(transformCondition);

  const destructureNestedConditions = (conditions) =>
    conditions
      ?.filter((condition) => condition?.is_group)
      ?.map((condition) => ({
        query_type: condition?.query_type,
        condition: destructureConditions(condition?.condition),
        nested_condition: destructureNestedConditions(condition?.condition),
      }));

  useEffect(() => {
    const data = {
      query_id: 1,
      query_type: 'and',
      condition: [
        {
          title: 'Communication.Whatsapp.Content',
          action: 'contains',
          item: ['checkup'],
          min_age: '',
          max_age: '',
          is_group: false,
        },
        {
          query_type: 'and',
          is_group: true,
          condition: [
            {
              title: 'Appointment.Appointment ID',
              action: 'not-contains',
              item: [123],
              min_age: '',
              max_age: '',
              is_group: false,
            },
            {
              query_type: 'and',
              is_group: true,
              condition: [
                {
                  title: 'Status',
                  action: 'contains',
                  item: ['Active'],
                  min_age: '',
                  max_age: '',
                  is_group: false,
                },
                {
                  title: 'Profile holder age',
                  action: 'between',
                  item: [],
                  min_age: 20,
                  max_age: 80,
                  is_group: false,
                },
              ],
            },
          ],
        },
      ],
    };

    setQuery(data);
    const { query_type, condition } = data;
    const query = {
      query_type,
      condition: destructureConditions(condition),
      nested_condition: destructureNestedConditions(condition),
    };
    form.setFieldsValue(query);

    const formattedData = RuleDataOption?.map((option) => ({
      label: option.title,
      value: option.title,
      inputType: option.input_type,
      children: option.values
        ? option.values?.map((child) => ({
            label: child.selected_value,
            value: child.selected_value,
            inputType: child.input_type,
          }))
        : [],
    }));
    setFormData(formattedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="queryBuilder">
      <Form
        form={form}
        onFinish={(val) => handleSubmit(val)}
        name="query_builder"
        autoComplete="off"
      >
        <div className="queryTop">
          <Space align="middle">
            <Form.Item name="query_type" noStyle rules={[{ required: true }]}>
              <Select
                placeholder="Select condition"
                size="default"
                style={{ width: 120 }}
                options={combinatorOption}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                return (
                  <div className="queryTypeStatement">
                    {handleQueryType(getFieldValue('query_type'))}
                  </div>
                );
              }}
            </Form.Item>
          </Space>
        </div>
        <div className="queryNewCondition">
          <Form.List name="condition">
            {(fields, { remove }) => (
              <>
                {fields?.map((field, index) => (
                  <div className="queryPlacement">
                    {renderQuery(
                      field,
                      index,
                      ['condition'],
                      remove,
                      true,
                      null,
                    )}
                  </div>
                ))}
              </>
            )}
          </Form.List>
          <Form.List name="nested_condition">
            {(fields, { remove }) => (
              <>
                {fields.map((field, index) => (
                  <div className="queryPlacement">
                    {renderQueryGroup(
                      field,
                      index,
                      ['nested_condition'],
                      remove,
                      true,
                    )}
                  </div>
                ))}
                <div className="queryTop">
                  <Space>
                    <Button
                      className="queryBtn"
                      type="dashed"
                      size="default"
                      onClick={() => handleAddGroup(['nested_condition'])}
                      icon={<PlusOutlined style={{ color: '#12289b' }} />}
                    >
                      Add group
                    </Button>
                    <Button
                      className="queryBtn"
                      type="dashed"
                      size="default"
                      onClick={() => handleAddCondition(['condition'])}
                      icon={<PlusOutlined style={{ color: '#12289b' }} />}
                    >
                      Add condition
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </Form.List>
        </div>
      </Form>
      <Divider />
      <Button type="primary" onClick={(val) => form.submit(val)}>
        Execute
      </Button>
      <Typography>
        <pre>{JSON.stringify(query, null, 2)}</pre>
      </Typography>
    </div>
  );
};

export default QueryBuilder;
