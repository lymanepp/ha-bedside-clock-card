# YAML-managed dashboard

The recommended installation in the main README uses Home Assistant's UI. Use this alternative only when you intentionally manage dashboards in YAML.

## 1. Register the dashboard

Ensure `configuration.yaml` includes your Lovelace configuration file:

```yaml
lovelace: !include lovelace.yaml
```

Add the dashboard to `lovelace.yaml`:

```yaml
dashboards:
  bedside-clock:
    mode: yaml
    filename: dashboards/bedside-clock.yaml
    title: Bedside Clock
    icon: mdi:clock-digital
    show_in_sidebar: false
```

## 2. Create the dashboard file

Create `/config/dashboards/bedside-clock.yaml`:

```yaml
title: Bedside Clock

views:
  - title: Clock
    path: clock
    panel: true

    cards:
      - type: custom:bedside-clock-card
        default_device: primary
        time_format: "12"
        show_seconds: false
        show_date: true
        show_weather_text: true
        theme: warm
        burn_in_shift: true

        weather_entity: weather.home

        devices:
          primary:
            battery: sensor.primary_phone_battery_level

          secondary:
            battery: sensor.secondary_phone_battery_level
```

Replace the example entity IDs with entities from your own Home Assistant installation.

## 3. Open the dashboard

For the `primary` device:

```text
/bedside-clock/clock?device=primary
```

For the `secondary` device:

```text
/bedside-clock/clock?device=secondary
```

The `device` value must match a key under `devices:`. If it is absent or invalid, the card uses `default_device` when that key exists; otherwise it uses the first configured device.
