import React from 'react'

export const RoomSettingsMenu = () => {
    const { onClose, selectedValue, open } = props;
    const handleClose = () => {
        onClose(selectedValue);
    };
    const handleListItemClick = (value: string) => {
        onClose(value);
    };
    return (
    <div>RoomSettingsMenu</div>
    )
}
