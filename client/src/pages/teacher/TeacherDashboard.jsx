import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
import { Users, Clock, CheckCircle } from "lucide-react";



const TeacherDashboard = () => {
  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector(state.auth);

  useEffect(()=>{
    dispatch(getTeacherDashboardStats())
  },[dispatch])

                                                                                                                   
  const statsCards = [                                                                                           
    {                                                                                                            
      title: "Assigned Students",                                                                                
      value: authUser?.assignedStudents?.length || 0,                                                          
      loading,
      icon: Users,
      bg: "bg-blue-100",                                                                                         
      color: "text-blue-600",
    },                                                                                                           
    {                                                                                                          
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      icon: Clock,                                                                                               
      bg: "bg-yellow-100",
      color: "text-yellow-600",                                                                                  
    },                                                                                                         
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      icon: CheckCircle,                                                                                         
      bg: "bg-green-100",
      color: "text-green-600",                                                                                   
    },                                                                                                         
  ];

  return (
    <>
      <div className="space-y-6">                                                                                    
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">                     
          <h1 className="text-2xl font-bold mb-2">Teacher Dashboard</h1>                                             
            <p className="text-green-100">                                                                             
        Manage your students and provide guidance on their projects.                                             
              </p>                                                                                                       
           </div>                                                                                                     
        </div>   


  {/* STATS CARDS*/}                                                                                             
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">                                         
    {dashboardStats && dashboardStats.map(({ title, value, loading, Icon, bg, color }) => {                                        
      return (                                                                                                 
        <div key={index} className={`card`}>                                                                     
          <div className="flex items-center">                                                                    
            <div className={`p-3 ${bg} rounded-lg`}>
              <Icon className={`w-6 h-6 ${color}`} />                                                   
            </div>                                                                                               
  
            <div className="ml-4">                                                                               
              <p className={`text-sm font-medium text-slate-600`}>                                             
                {title}                                                                                          
              </p>
              <p className={`text-sm font-medium text-slate-800`}>                                               
                {loading ? "..." : value}                                                                      
              </p>                                                                                               
            </div>
          </div>                                                                                                 
        </div>                                                                                                 
      );
    })}
  </div>




      {/* RECENT ACTIVITY */}                                                       
  <div className="card">                                                        
    <div className="card-header">                                            
      <h2 className="card-title">Recent Activity</h2>                           
      <p className="card-subtitle">Latest notifications and updates</p>
    </div>                                                                      
                                                                             
<div className="space-y-4">                                                   
    {loading ? (                                                                
      <Loader size={32} className="animate-spin" />                             
    ) : dashboardStats?.recentNotifications?.length > 0 ? (                  
      dashboardStats.recentNotifications.map((notification) => {                
        return (                                                                
          <div
            key={notification._id}                                              
            className="flex items-center p-3 bg-slate-50 rounded-lg"         
          >
            <div className="p-2 bg-white rounded-lg text-slate-600">
              <MoveDiagonal className="w-5 h-5" />                              
            </div>                                                              
                                                                                
            <div className="ml-3 flex-1">                                       
              <p className="text-sm text-slate-800">{notification.message}</p>
              <p className="text-sm text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>                                                              
          </div>                                                             
        );
      })
    ) : (                                                                       
      <div className="text-center py-4 text-slate-500">
        No recent activity                                                      
      </div>                                                                 
    )}                                                                  
  </div>  
    </div> 
                   
  </>
  );
};

export default TeacherDashboard;