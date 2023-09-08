import { useEffect, useState } from "react";



export default function InfiniteScroll(
  pageNumber: number,
  url: string,
  from_where: string
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [devicestructure, setdevicestructure] = useState({
    // resourceType: "",
    // id: "",
    // type: "",
    // total: "",
    // link: [
    //   {
    //     relation: "",
    //     url: "",
    //   },
    // ],
    entry: [
      {
        fullUrl: "",
        resource: {
          resourceType: "",
          id: "",
          status: "",
          manufacturer: "",
          patient:{
            reference: ""
          },
          meta: {
            versionId: "",
            lastUpdated: "",
          },
          identifier: [
            {
              system: "",
              value: "",
            },
          ],
          extension: [
            {
              url: "",
              valueString: "",
            },
          ],
        },
        search: {
          mode: "",
          score: "",
        },
      },
    ],
  });
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${url}${pageNumber}`, {
      credentials: "omit", // send cookies and HTTP authentication information
      headers: {
        Authorization: "Basic " + btoa("fhiruser:change-password"), // set HTTP basic auth header
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        if (data.entry && 1 == 1) {
          if (from_where == "home") {
            setdevicestructure((current) => ({
              ...current,
              entry: [...current.entry, ...data.entry],
            }));
            
          }
          setHasMore(pageNumber * 10 < data.total);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(true);
      });
  }, [pageNumber]);

  return { loading, error, devicestructure, hasMore };
}
