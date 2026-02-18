import cn from "classnames";
import styles from "./Form.module.sass";
import Icon from "../Icon";

const Form = ({
  className,
  big,
  onSubmit,
  placeholder,
  value,
  setValue,
  type,
  name,
  icon,
}: {
  className: string;
  big: boolean;
  onSubmit: () => void;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  type: string;
  name: string;
  icon: string;
}) => {
  return (
    <div
      className={cn(className, styles.form, {
        [styles.big]: big,
      })}
    >
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        name={name}
        placeholder={placeholder}
        required
      />
      <button
        onClick={onSubmit}
        className={styles.btn}>
        <Icon name={icon} size="14" />
      </button>
    </div>
  );
};

export default Form;
