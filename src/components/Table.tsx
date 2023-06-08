import React, { useMemo } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
export const Table = () => {
  type Alarm = {
    date: string;
    time: string;
    alarmType: string;
    priority: string;
  };

  const data: Alarm[] = [
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Heater Temperature",
      priority: "Low",
    },
    {
      date: "08/06/2023",
      time: "12:11:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 1",
      priority: "Medium",
    },
    {
      date: "09/06/2023",
      time: "12:09:23",
      alarmType: "Skin Temperature 1",
      priority: "High",
    },
    {
      date: "09/06/2023",
      time: "02:10:23",
      alarmType: "Heater Temperature",
      priority: "Medium",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Heater Temperature",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Low",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Low",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "08/06/2023",
      time: "08:10:23",
      alarmType: "Skin Temperature 2",
      priority: "High",
    },
    {
      date: "28/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Medium",
    },
    {
      date: "23/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Medium",
    },
    {
      date: "11/06/2023",
      time: "04:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Medium",
    },
    {
      date: "05/06/2023",
      time: "11:22:23",
      alarmType: "Skin Temperature 2",
      priority: "Medium",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Low",
    },
    {
      date: "08/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Low",
    },
    {
      date: "10/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Low",
    },
    {
      date: "07/06/2023",
      time: "12:10:23",
      alarmType: "Skin Temperature 2",
      priority: "Medium",
    },
  ];

  const columns = useMemo<MRT_ColumnDef<Alarm>[]>(
    () => [
      {
        accessorKey: "date", //normal accessorKey

        header: "Date",

        size: 100,
      },

      {
        accessorKey: "time",

        header: "Time",

        size: 100,
      },

      {
        accessorKey: "alarmType",

        header: "Alarm",

        size: 100,
      },

      {
        accessorKey: "priority",

        header: "Priority",

        size: 100,
      },
    ],

    []
  );
  return (
    <div>
      <MaterialReactTable columns={columns} data={data} />
    </div>
  );
};
