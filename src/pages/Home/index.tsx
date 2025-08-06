import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { PrefetchKeys } from "apis/queryKeys";
import HomeService from "apis/services/Home";
import { useEffect } from "react";

const Home = () => {
  const params = useParams();
  const coinList = useQuery({
    queryKey: [PrefetchKeys.HOME],
    queryFn: () => HomeService.getList(params),
  });

  return (
    <main>
      <header className="w-full flex justify-center items-center h-[58px] text-green-300 bg-primary">
        header
        <Link className="ml-4 text-brand" to="/about">
          about
        </Link>
      </header>
      <main>
        Home
        <ul>
          {coinList.data?.map((i) => (
            <li
              onClick={() => {
                console.log(i);
              }}
              key={i.key}
            >
              {i.content}
            </li>
          ))}
        </ul>
      </main>
      <footer>footer</footer>
    </main>
  );
};

export default Home;
