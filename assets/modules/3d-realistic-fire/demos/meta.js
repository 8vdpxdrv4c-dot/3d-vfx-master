export const meta={
  "name": "真实火焰",
  "looks": [
    {
      "id": "small",
      "title": "真实小火焰",
      "params": {
        "variant": "small",
        "scale": 2
      }
    },
    {
      "id": "large",
      "title": "真实大火焰",
      "params": {
        "variant": "large",
        "scale": 2
      }
    }
  ],
  "schema": [
    {
      "key": "variant",
      "label": "火焰形态",
      "options": [
        "small",
        "large"
      ],
      "default": "small"
    },
    {
      "key": "scale",
      "label": "大小",
      "min": 0.1,
      "max": 10,
      "step": 0.1,
      "default": 2
    },
    {
      "key": "speed",
      "label": "播放速度",
      "min": 0,
      "max": 2,
      "step": 0.05,
      "default": 1
    }
  ]
};
