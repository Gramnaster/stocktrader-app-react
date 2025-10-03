import separator1 from '../../assets/images/icon-separator-01.png';
import img1 from '../../assets/images/img-01.png';
import img2 from '../../assets/images/img-02.png';

const Detail = () => {
  return (
    <div className='flex flex-col items-center'>
      {' '}
      <img
        src={separator1}
        className="w-[658px] h-[5px] my-15 align-middle justify-center items-center"
      />
      <div className="align-element my-5 items-center gap-20">
        <div className="h-[346px] w-full flex flex-row gap-[40px] mb-30">
          <div className="flex flex-col text-left w-[500px]">
            <h2 className="text-5xl font-bold ">
              TRADE <span className="text-primary">FAST</span>.
            </h2>
            <h2 className="text-5xl font-bold mb-[40px]">
              TRADE <span className="text-primary">SMART</span>.
            </h2>
            <p className="text-2xl mb-[20px]">
              We have the{' '}
              <span className="text-secondary uppercase">Top 100 stocks </span>{' '}
              from NASDAQ and we keep its data fresh.{' '}
            </p>
            <p className="text-2xl mb-[20px]">
              Now fetching data at a whopping speed of{' '}
              <span className="text-secondary uppercase">
                4.0 API calls per second!
              </span>{' '}
            </p>
            <p className="text-2xl mb-[20px]">
              Now <span className="underline">THAT</span> is orbital speed.
            </p>
          </div>
          <img src={img1} className="h-[346px] w-[482px]" />
        </div>
        <div className="h-[346px] w-full flex flex-row gap-[40px]">
          <img src={img2} className="h-[346px] w-[482px]" />
          <div className="flex flex-col text-left w-[500px]">
            <h2 className="text-5xl font-bold mb-[40px]">
              TIRED OF WEBSITE BLOAT?{' '}
              <span className="text-primary">NOT HERE</span>.
            </h2>
            <p className="text-2xl mb-[20px]">
              Spaceships need to be lightweight or they won’t make it to space.
            </p>
            <p className="text-2xl mb-[20px]">
              We keep our software small so you will{' '}
              <span className="text-secondary uppercase">
                never get lag, delay, or any timeout
              </span>{' '}
              from too many features!{' '}
            </p>
          </div>
        </div>
      </div>
      <img
        src={separator1}
        className="w-[658px] h-[5px] my-15 align-middle justify-center items-center"
      />
    </div>
  );
};
export default Detail;
