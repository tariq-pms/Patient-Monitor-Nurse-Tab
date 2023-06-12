import { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
export const Table = () => {
  type Alarm = {
    date: string;
    time: string;
    alarmType: string;
    priority: string;
  };

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



useEffect(() => {
  fetch(
    'https://localhost:9443/fhir-server/api/v4/Communication?_count=50',
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

  return (
    <div>
      HELLO
      <MaterialReactTable enableGrouping 
      initialState={{
        density: 'compact',
        expanded: true, //expand all groups by default
        grouping: ['date'], //an array of columns to group by by default (can be multiple)
        pagination: { pageIndex: 0, pageSize: 20 },
        sorting: [{ id: 'date', desc: false }], //sort by state by default

      }}
      columns={columns} data={data} />
    </div>
  );
};
