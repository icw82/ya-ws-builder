const debounce = function debounce<A extends any[], R extends any>(
    /** Оригинальная функция */
    original: (...args: A) => R | Promise<R>,

    /** Демпфирующая задержка [мс] */
    delay: number
): (...args: A) => void {
    let timer: NodeJS.Timeout | null = null;
    let pending = false;

    const wrapper = function(...args: A) {
        clearTimeout(timer);

        // console.log('this is', this);

        timer = setTimeout(async () => {
            if (pending) {
                wrapper.apply(this, args);

                return;
            }

            pending = true;

            await original.apply(this, args);
            pending = false;

        }, delay);
    }

    return wrapper
}

const debounceMethod = (delay: number): MethodDecorator => {
    return <T>(
        /**
         * Либо функция-конструктор класса для статического элемента,
         * либо прототип класса для элемента экземпляра
         */
        target: Object,

        /** Имя элемента */
        propertyKey: string | symbol,

        /** Дескриптор свойства для элемента */
        descriptor: TypedPropertyDescriptor<T>
    ): void | TypedPropertyDescriptor<T> => {
        const original = descriptor.value;

        // descriptor.value = debounce(original, delay);

        // return {
        //   ...descriptor,
        //     value: debounced,
        // };

        return descriptor;
    }
}


export {
    debounce,
    // debounceMethod,
}
