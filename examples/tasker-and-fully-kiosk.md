# Tasker and Fully Kiosk

Use a dedicated fullscreen browser rather than forcing the normal Home Assistant Companion app into fullscreen.

## Fully Kiosk start URL

```text
http://ha.local:8123/bedside-clock/clock?device=primary&kiosk
```

Use the corresponding `device` query parameter for each phone.

Configure Fully Kiosk to hide the status and navigation bars and keep the screen awake.

## Tasker dock-entry task

1. Set `%ClockDocked` to `1`.
2. Turn on the display.
3. Configure automatic brightness as desired.
4. Disable or extend the display timeout.
5. Launch Fully Kiosk Browser.

## Tasker dock-exit task

1. Set `%ClockDocked` to `0`.
2. Return to Home or stop Fully Kiosk.
3. Restore the prior brightness and display-timeout behavior.
