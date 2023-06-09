import React, { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Alarm } from "@mui/icons-material";
export const Table = () => {
  type Alarm = {
    date: string;
    time: string;
    alarmType: string;
    priority: string;
  };

  // const data: Alarm[] = [
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Heater Temperature",
  //     priority: "Low",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:11:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 1",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "09/06/2023",
  //     time: "12:09:23",
  //     alarmType: "Skin Temperature 1",
  //     priority: "High",
  //   },
  //   {
  //     date: "09/06/2023",
  //     time: "02:10:23",
  //     alarmType: "Heater Temperature",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Heater Temperature",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Low",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Low",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "08:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "High",
  //   },
  //   {
  //     date: "28/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "23/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "11/06/2023",
  //     time: "04:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "05/06/2023",
  //     time: "11:22:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Medium",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Low",
  //   },
  //   {
  //     date: "08/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Low",
  //   },
  //   {
  //     date: "10/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Low",
  //   },
  //   {
  //     date: "07/06/2023",
  //     time: "12:10:23",
  //     alarmType: "Skin Temperature 2",
  //     priority: "Medium",
  //   },
  // ];

  const [communicationStructure, setCommunicationStructure] = useState({
    "resourceType": "",
    "id": "",
    "type": "",
    "total": "",
    "link": [
        {
            "relation": "",
            "url": ""
        }
    ],
    "entry": [
        {
            "fullUrl": "",
            "resource": {
                "resourceType": "",
                "id": "",
                "meta": {
                    "versionId": "",
                    "lastUpdated": ""
                },
                "extension": [
                    {
                        "url": "",
                        "valueCodeableConcept": {
                            "coding": [
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                },
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                },
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                }
                            ]
                        }
                    },
                    {
                        "url": "",
                        "valueCodeableConcept": {
                            "coding": [
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                },
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                },
                                {
                                    "system": "",
                                    "code": "",
                                    "display": ""
                                }
                            ]
                        }
                    }
                ],
                "status": "",
                "sent": "",
                "sender": {
                    "reference": ""
                },
                "payload": [
                    {
                        "contentReference": {
                            "display": ""
                        }
                    }
                ]
            },
            "search": {
                "mode": "",
                "score": ""
            }
        },


    ]
});
  const [data, setData] = useState<{ date: string; time: string; alarmType: string; priority: string; }[]>([])

useEffect(() => {
  fetch(
    'https://localhost:9443/fhir-server/api/v4/Communication',
    {
      credentials: "omit", // send cookies and HTTP authentication information
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      setCommunicationStructure(data);
    })
    .catch((err) => console.log(err));
}, [])

useEffect(() => {
  if(communicationStructure.resourceType!=""){
    communicationStructure.entry.map((val) => {
      var x = 0;
      var date = String(val.resource.sent.split("T")[0])
      var time = String(val.resource.sent.split("T")[1].split("-")[0])
      val.resource.extension[0].valueCodeableConcept.coding.map((realval) => {
        
        var xxx = {
          date: date,
          time: time,
          alarmType: realval.display,
          priority: val.resource.extension[1].valueCodeableConcept.coding[x].display,
        }
        x+=1;
        setData((prevdata) => [...prevdata, xxx]);
        // console.log(xxx)
        
      })
    })
  }
}, [communicationStructure])



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
      HELLO
      <MaterialReactTable columns={columns} data={data} />
    </div>
  );
};
