import {describe, it, expect} from 'vitest';
import {mount} from '@vue/test-utils';
import Button from '~/components/Ui/Button.vue';

describe('Ui/Button', () => {
  it('показывает содержимое слота', () => {
    const wrapper = mount(Button, {slots: {default: 'Сохранить'}});

    expect(wrapper.text()).toContain('Сохранить');
    expect(wrapper.element.tagName).toBe('BUTTON');
  });

  it('по умолчанию не отправляет форму', () => {
    const wrapper = mount(Button);

    expect(wrapper.attributes('type')).toBe('button');
  });

  it('без иконки не рисует для неё пустой элемент', () => {
    const wrapper = mount(Button, {slots: {default: 'Текст'}});

    expect(wrapper.find('span').exists()).toBe(false);
  });

  it('показывает иконку перед текстом, когда её передали', () => {
    const wrapper = mount(Button, {
      props: {icon: '💾'},
      slots: {default: 'Сохранить'},
    });

    expect(wrapper.find('span').text()).toBe('💾');
    expect(wrapper.text().indexOf('💾')).toBeLessThan(wrapper.text().indexOf('Сохранить'));
  });

  it('по умолчанию выглядит как основная кнопка', () => {
    const wrapper = mount(Button);

    expect(wrapper.classes()).toContain('bg-primary');
  });

  it('меняет оформление на приглушённое по варианту soft', () => {
    const wrapper = mount(Button, {props: {variant: 'soft'}});

    expect(wrapper.classes()).toContain('bg-surface-muted');
    expect(wrapper.classes()).not.toContain('bg-primary');
  });

  it('пробрасывает клик наружу', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('не кликается, когда отключена', async () => {
    const wrapper = mount(Button, {attrs: {disabled: true}});

    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('disabled:pointer-events-none');
  });
});
