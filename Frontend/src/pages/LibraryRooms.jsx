import { Box, Typography } from "@mui/material"
import { RoomBooking } from "./RoomBooking"


export const LibraryRooms = () => {
  return (
    <Box p={4}>

  <RoomBooking /> {/* 👈 this will render your existing booking UI */}
</Box>
  )
}
